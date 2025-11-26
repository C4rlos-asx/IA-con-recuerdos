import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// CORS headers helper
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
};

// Simple rate limiting with Redis (per userId or IP)
const RATE_LIMIT_MAX_REQUESTS = 60; // e.g. 60 requests
const RATE_LIMIT_WINDOW_SECONDS = 60; // per 60 seconds

async function checkRateLimit(identifier: string | null): Promise<{ ok: boolean; remaining?: number }> {
    if (!identifier) {
        // If we can't identify the user/IP, skip limiting (or you could choose a generic key)
        return { ok: true };
    }

    const key = `rate_limit:chat:${identifier}`;

    try {
        // Incrementa el contador del usuario
        const count = await redis.incr(key);

        // Si es la primera vez, establece la expiración de la ventana
        let ttl = await redis.ttl(key);
        if (ttl < 0) {
            await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
            ttl = RATE_LIMIT_WINDOW_SECONDS;
        }

        if (count > RATE_LIMIT_MAX_REQUESTS) {
            return { ok: false, remaining: 0 };
        }

        return { ok: true, remaining: Math.max(RATE_LIMIT_MAX_REQUESTS - count, 0) };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        // En caso de fallo de Redis, no bloqueamos al usuario
        return { ok: true };
    }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { messages, userId, model } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid messages format' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Identify client for rate limiting: prefer userId, fallback to no limit
        const identifier = userId || null;
        const rate = await checkRateLimit(identifier);

        if (!rate.ok) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    message: 'Has enviado demasiadas solicitudes. Intenta de nuevo en unos segundos.',
                },
                { status: 429, headers: corsHeaders }
            );
        }

        const lastMessage = messages[messages.length - 1];
        const userMessage = lastMessage.content;

        let botResponse: string;

        // Determine which AI provider to use
        if (model?.provider === 'gemini') {
            // Use Google Gemini
            const geminiModel = genAI.getGenerativeModel({ model: model.id });

            // Convert messages to Gemini format
            const chat = geminiModel.startChat({
                history: messages.slice(0, -1).map((msg: any) => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }],
                })),
            });

            const result = await chat.sendMessage(userMessage);
            botResponse = result.response.text();
        } else {
            // Use OpenAI (default)
            const completion = await openai.chat.completions.create({
                model: model?.id || 'gpt-4',
                messages: messages.map((msg: any) => ({
                    role: msg.role,
                    content: msg.content,
                })),
            });

            botResponse = completion.choices[0]?.message?.content || 'No response generated';
        }

        // 3. Save Chat to DB (if userId is provided)
        if (userId) {
            let user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                // Create user if doesn't exist
                user = await prisma.user.create({
                    data: { id: userId, email: `user-${userId}@example.com` }
                });
            }

            await prisma.chat.create({
                data: {
                    userId: user.id,
                    messages: JSON.stringify([...messages, { role: 'assistant', content: botResponse }]),
                },
            });
        }

        // 4. Save to Memory (Optional)
        if (userMessage.toLowerCase().includes('recuerda') && userId) {
            await prisma.memory.create({
                data: {
                    userId,
                    content: userMessage,
                },
            });
        }

        return NextResponse.json(
            { role: 'assistant', content: botResponse },
            { headers: corsHeaders }
        );

    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500, headers: corsHeaders }
        );
    }
}
