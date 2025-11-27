import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const RATE_LIMIT_MAX_REQUESTS = 60;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const CONTEXT_WINDOW_SIZE = 10;

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
        await redis.ltrim(key, -CONTEXT_WINDOW_SIZE, -1);
        await redis.expire(key, 60 * 60 * 24);
    } catch (error) {
        console.error('Error saving context to Redis:', error);
    }
}

async function getRelevantMemories(userId: string): Promise<string[]> {
    try {
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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const chatId = searchParams.get('chatId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400, headers: corsHeaders });
    }

    try {
        if (chatId) {
            // Get specific chat history
            const chat = await prisma.chat.findUnique({
                where: { id: chatId },
            });

            if (!chat || chat.userId !== userId) {
                return NextResponse.json({ error: 'Chat not found' }, { status: 404, headers: corsHeaders });
            }

            // Parse messages if they are stored as JSON string
            const messages = typeof chat.messages === 'string'
                ? JSON.parse(chat.messages)
                : chat.messages;

            return NextResponse.json({ ...chat, messages }, { headers: corsHeaders });
        } else {
            // List user chats
            const chats = await prisma.chat.findMany({
                where: { userId },
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return NextResponse.json(chats, { headers: corsHeaders });
        }
    } catch (error: any) {
        console.error('Error fetching chats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
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

        const { messages, userId, model, chatId, file } = body;

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

        if (userId) {
            const memories = await getRelevantMemories(userId);
            if (memories.length > 0) {
                systemContext += `\n\nFACTS ABOUT THE USER (Long-term Memory):\n${memories.map(m => `- ${m}`).join('\n')}\n`;
                systemContext += "Use these facts to personalize your response. If the user asks what you know about them, refer to these.";
            }
        }

        const messagesForAI = [
            { role: 'system', content: `You are a helpful AI assistant.${systemContext}` },
            ...messages.map((msg: any) => ({ role: msg.role, content: msg.content }))
        ];

        // --- AI Generation ---
        let botResponse: string;

        try {
            if (model?.provider === 'gemini') {
                if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');

                const geminiModelId = model.id || 'gemini-1.5-flash-latest';
                const geminiModel = genAI.getGenerativeModel({ model: geminiModelId });

                if (file && file.type.startsWith('image/')) {
                    // Handle image with Gemini Vision
                    const base64Data = file.data.split(',')[1]; // Remove data:image/xxx;base64, prefix

                    const imagePart = {
                        inlineData: {
                            data: base64Data,
                            mimeType: file.type
                        }
                    };

                    const result = await geminiModel.generateContent([
                        userMessageContent || 'Analiza esta imagen',
                        imagePart
                    ]);
                    botResponse = result.response.text();
                } else {
                    // Text only
                    const history = messagesForAI.slice(0, -1).map(msg => ({
                        role: msg.role === 'assistant' || msg.role === 'system' ? 'model' : 'user',
                        parts: [{ text: msg.content }],
                    }));

                    const chat = geminiModel.startChat({ history });
                    const result = await chat.sendMessage(userMessageContent);
                    botResponse = result.response.text();
                }

            } else {
                // OpenAI
                const openaiModelId = model?.id || 'gpt-3.5-turbo';

                if (file && file.type.startsWith('image/') && (openaiModelId.includes('gpt-4') || openaiModelId.includes('gpt-4o'))) {
                    // GPT-4 Vision
                    const completion = await openai.chat.completions.create({
                        model: openaiModelId,
                        messages: [
                            ...messagesForAI.slice(0, -1),
                            {
                                role: 'user',
                                content: [
                                    { type: 'text', text: userMessageContent || 'Analiza esta imagen' },
                                    {
                                        type: 'image_url',
                                        image_url: {
                                            url: file.data
                                        }
                                    }
                                ]
                            }
                        ],
                    });
                    botResponse = completion.choices[0]?.message?.content || 'No response';
                } else {
                    // Text only
                    const completion = await openai.chat.completions.create({
                        model: openaiModelId,
                        messages: messagesForAI,
                    });
                    botResponse = completion.choices[0]?.message?.content || 'No response';
                }
            }
        } catch (aiError: any) {
            console.error('AI API Error:', aiError);
            return NextResponse.json({ error: 'AI Error', details: aiError.message }, { status: 500, headers: corsHeaders });
        }

        // --- Side Effects (Async) ---
        let finalChatId = chatId;

        if (userId) {
            // 1. Save/Update Chat in DB
            try {
                let user = await prisma.user.findUnique({ where: { id: userId } });
                if (!user) {
                    user = await prisma.user.create({
                        data: { id: userId, email: `user-${userId}@example.com` }
                    });
                }

                const newMessages = [...messages, { role: 'assistant', content: botResponse }];

                if (chatId) {
                    // Update existing chat
                    await prisma.chat.update({
                        where: { id: chatId },
                        data: {
                            messages: JSON.stringify(newMessages),
                        }
                    });
                } else {
                    // Create new chat
                    const title = userMessageContent.substring(0, 50) + (userMessageContent.length > 50 ? '...' : '');

                    const newChat = await prisma.chat.create({
                        data: {
                            userId: user.id,
                            title,
                            messages: JSON.stringify(newMessages),
                        },
                    });
                    finalChatId = newChat.id;
                }
            } catch (dbError: any) {
                console.error('Error saving to DB:', dbError);
            }

            // 2. Save to Redis
            saveToContext(userId, { role: 'user', content: userMessageContent });
            saveToContext(userId, { role: 'assistant', content: botResponse });

            // 3. Save to Memory
            if (userMessageContent.toLowerCase().includes('recuerda') || userMessageContent.toLowerCase().includes('guarda esto')) {
                prisma.memory.create({
                    data: { userId, content: userMessageContent }
                }).catch(e => console.error('Memory Save Error:', e));
            }
        }

        return NextResponse.json(
            {
                role: 'assistant',
                content: botResponse,
                chatId: finalChatId
            },
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
