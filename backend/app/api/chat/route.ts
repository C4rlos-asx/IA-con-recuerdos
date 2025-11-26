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
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Constants
const RATE_LIMIT_MAX_REQUESTS = 60;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const CONTEXT_WINDOW_SIZE = 10; // Number of messages to keep in Redis context

// --- Helper Functions ---

async function checkRateLimit(identifier: string | null): Promise<{ ok: boolean; remaining?: number }> {
    if (!identifier) return { ok: true };
    const key = `rate_limit:chat:${identifier}`;
    try {
        const count = await redis.incr(key);
        let ttl = await redis.ttl(key);
        if (ttl < 0) {
            await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
            ttl = RATE_LIMIT_WINDOW_SECONDS;
        }
        if (count > RATE_LIMIT_MAX_REQUESTS) return { ok: false, remaining: 0 };
        return { ok: true, remaining: Math.max(RATE_LIMIT_MAX_REQUESTS - count, 0) };
    } catch (error) {
        console.error('Rate limit check failed:', error);
        return { ok: true };
    }
}

async function getConversationContext(userId: string): Promise<any[]> {
    try {
        const key = `chat:context:${userId}`;
        const history = await redis.lrange(key, 0, -1);
        // Redis stores strings, so we parse them back to objects. 
        // We reverse because lrange gives us the list, but we want chronological order if we pushed to head/tail correctly.
        // Let's assume we push to tail (rpush), so lrange 0 -1 is chronological.
        return history.map(item => JSON.parse(item));
    } catch (error) {
        console.error('Error fetching context from Redis:', error);
        return [];
    }
}

async function saveToContext(userId: string, message: any) {
    try {
        const key = `chat:context:${userId}`;
        await redis.rpush(key, JSON.stringify(message));
        // Trim to keep only the last N messages
        await redis.ltrim(key, -CONTEXT_WINDOW_SIZE, -1);
        // Set expiry for context (e.g., 24 hours) so it doesn't stale forever
        await redis.expire(key, 60 * 60 * 24);
    } catch (error) {
        console.error('Error saving context to Redis:', error);
    }
}

async function getRelevantMemories(userId: string): Promise<string[]> {
    try {
        // For now, fetch the latest 5 memories. 
        // TODO: Implement vector search or keyword matching for better relevance.
        const memories = await prisma.memory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        return memories.map(m => m.content);
    } catch (error) {
        console.error('Error fetching memories:', error);
        return [];
    }
}

// --- Route Handlers ---

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET() {
    return NextResponse.json(
        { message: 'Use POST to interact with the chat API' },
        { status: 200, headers: corsHeaders }
    );
}

export async function POST(request: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: corsHeaders });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });
        }

        const { messages, userId, model } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Invalid messages' }, { status: 400, headers: corsHeaders });
        }

        const lastMessage = messages[messages.length - 1];
        const userMessageContent = lastMessage.content;

        // Rate Limiting
        const rate = await checkRateLimit(userId || null);
        if (!rate.ok) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: corsHeaders });
        }

        // --- Context & Memory Retrieval ---
        let systemContext = "";
        let previousMessages = [];

        if (userId) {
            // 1. Get Long-term Memories
            const memories = await getRelevantMemories(userId);
            if (memories.length > 0) {
                systemContext += `\n\nFACTS ABOUT THE USER (Long-term Memory):\n${memories.map(m => `- ${m}`).join('\n')}\n`;
                systemContext += "Use these facts to personalize your response. If the user asks what you know about them, refer to these.";
            }

            // 2. Get Short-term Context (Redis)
            // If the client sends only the latest message (length 1), it might be a new session or a refresh.
            // In this case, we try to restore context from Redis.
            if (messages.length === 1) {
                const redisHistory = await getConversationContext(userId);
                if (redisHistory.length > 0) {
                    console.log(`Restoring ${redisHistory.length} messages from Redis context for user ${userId}`);
                    previousMessages = redisHistory;
                }
            }
        }

        const messagesForAI = [
            { role: 'system', content: `You are a helpful AI assistant.${systemContext}` },
            ...previousMessages,
            ...messages.map((msg: any) => ({ role: msg.role, content: msg.content }))
        ];

        // --- AI Generation ---
        let botResponse: string;

        try {
            if (model?.provider === 'gemini') {
                if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');

                const geminiModelId = model.id || 'gemini-1.5-flash-latest';
                const geminiModel = genAI.getGenerativeModel({ model: geminiModelId });

                // Gemini format
                const history = messagesForAI.slice(0, -1).map(msg => ({
                    role: msg.role === 'assistant' || msg.role === 'system' ? 'model' : 'user', // Gemini uses 'model'
                    parts: [{ text: msg.content }],
                }));

                // If system message is first, Gemini might prefer it in a specific way, 
                // but putting it as first history item usually works or is treated as context.
                // Actually Gemini has a systemInstruction property now, but let's stick to simple history for compatibility.

                const chat = geminiModel.startChat({ history });
                const result = await chat.sendMessage(userMessageContent);
                botResponse = result.response.text();

            } else {
                // OpenAI
                const openaiModelId = model?.id || 'gpt-3.5-turbo';
                const completion = await openai.chat.completions.create({
                    model: openaiModelId,
                    messages: messagesForAI,
                });
                botResponse = completion.choices[0]?.message?.content || 'No response';
            }
        } catch (aiError: any) {
            console.error('AI API Error:', aiError);
            return NextResponse.json({ error: 'AI Error', details: aiError.message }, { status: 500, headers: corsHeaders });
        }

        // --- Side Effects (Async) ---
        if (userId) {
            // 1. Save to DB (Chat Log)
            // We don't await this to speed up response
            prisma.chat.create({
                data: {
                    userId,
                    messages: JSON.stringify([...messages, { role: 'assistant', content: botResponse }]),
                }
            }).catch(e => console.error('DB Save Error:', e));

            // 2. Save to Redis (Context)
            saveToContext(userId, { role: 'user', content: userMessageContent });
            saveToContext(userId, { role: 'assistant', content: botResponse });

            // 3. Save to Long-term Memory (if explicitly asked or implicitly detected)
            // Simple keyword detection for now
            if (userMessageContent.toLowerCase().includes('recuerda') || userMessageContent.toLowerCase().includes('guarda esto')) {
                prisma.memory.create({
                    data: { userId, content: userMessageContent }
                }).catch(e => console.error('Memory Save Error:', e));
            }
        }

        return NextResponse.json(
            { role: 'assistant', content: botResponse },
            { headers: corsHeaders }
        );

    } catch (error: any) {
        console.error('Unexpected Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}

