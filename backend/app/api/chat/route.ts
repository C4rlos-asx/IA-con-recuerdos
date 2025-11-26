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
// Para simplificar y evitar problemas de configuración en Vercel,
// permitimos cualquier origen. Si quieres restringirlo en el futuro,
// cambia '*' por la URL exacta de tu frontend.
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

// Handle GET request - informativo para cuando alguien accede directamente a la URL
export async function GET() {
    return NextResponse.json(
        {
            message: 'Este endpoint solo acepta peticiones POST',
            description: 'Para usar este API, envía una petición POST con el siguiente formato:',
            example: {
                messages: [
                    { role: 'user', content: 'Hola' }
                ],
                userId: 'test-user',
                model: {
                    id: 'gpt-4',
                    name: 'GPT-4',
                    provider: 'openai'
                }
            }
        },
        { status: 200, headers: corsHeaders }
    );
}

export async function POST(request: Request) {
    try {
        // Validar variables de entorno críticas
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY no está configurada');
            return NextResponse.json(
                {
                    error: 'Configuración del servidor incompleta',
                    message: 'La clave de API de OpenAI no está configurada. Por favor, contacta al administrador.'
                },
                { status: 500, headers: corsHeaders }
            );
        }

        // Parsear el body con manejo de errores específico
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error('Error al parsear JSON:', parseError);
            return NextResponse.json(
                { error: 'Invalid JSON format', message: 'El cuerpo de la petición debe ser un JSON válido' },
                { status: 400, headers: corsHeaders }
            );
        }

        const { messages, userId, model } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid messages format', message: 'El campo "messages" debe ser un array' },
                { status: 400, headers: corsHeaders }
            );
        }

        if (messages.length === 0) {
            return NextResponse.json(
                { error: 'Empty messages', message: 'Debes enviar al menos un mensaje' },
                { status: 400, headers: corsHeaders }
            );
        }

        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || !lastMessage.content) {
            return NextResponse.json(
                { error: 'Invalid message format', message: 'El último mensaje debe tener contenido' },
                { status: 400, headers: corsHeaders }
            );
        }

        const userMessage = lastMessage.content;

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

        let botResponse: string;

        try {
            // Determine which AI provider to use
            if (model?.provider === 'gemini') {
                // Validar API key de Gemini
                if (!process.env.GEMINI_API_KEY) {
                    throw new Error('GEMINI_API_KEY no está configurada');
                }

                // Use Google Gemini
                // Asegurar que usamos nombres de modelos válidos para Gemini
                const geminiModelId = model.id || 'gemini-1.5-flash-latest';
                const geminiModel = genAI.getGenerativeModel({ model: geminiModelId });

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
                // Asegurar que usamos un modelo válido (gpt-3.5-turbo por defecto, que es gratuito)
                const openaiModelId = model?.id || 'gpt-3.5-turbo';
                const completion = await openai.chat.completions.create({
                    model: openaiModelId,
                    messages: messages.map((msg: any) => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                });

                botResponse = completion.choices[0]?.message?.content || 'No response generated';
            }
        } catch (aiError: any) {
            console.error('Error al llamar a la API de IA:', aiError);
            return NextResponse.json(
                {
                    error: 'AI API Error',
                    message: 'Error al comunicarse con el servicio de IA',
                    details: aiError?.message || 'Unknown AI error',
                    hint: aiError?.message?.includes('API key') 
                        ? 'Verifica que las API keys estén configuradas correctamente en Vercel'
                        : undefined
                },
                { status: 500, headers: corsHeaders }
            );
        }

        // 3. Save Chat to DB (if userId is provided)
        if (userId) {
            try {
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
            } catch (dbError: any) {
                // No fallamos toda la petición si falla guardar en DB, solo logueamos
                console.error('Error al guardar en la base de datos:', dbError);
                // Continuamos y respondemos con la respuesta de la IA de todas formas
            }
        }

        // 4. Save to Memory (Optional)
        if (userMessage.toLowerCase().includes('recuerda') && userId) {
            try {
                await prisma.memory.create({
                    data: {
                        userId,
                        content: userMessage,
                    },
                });
            } catch (memoryError: any) {
                // No fallamos si no podemos guardar la memoria, solo logueamos
                console.error('Error al guardar memoria:', memoryError);
            }
        }

        return NextResponse.json(
            { role: 'assistant', content: botResponse },
            { headers: corsHeaders }
        );

    } catch (error: any) {
        console.error('Error inesperado en chat API:', error);
        console.error('Stack trace:', error?.stack);
        
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: 'Ha ocurrido un error inesperado en el servidor',
                details: error instanceof Error ? error.message : 'Unknown error',
                type: error?.constructor?.name || 'Unknown'
            },
            { status: 500, headers: corsHeaders }
        );
    }
}
