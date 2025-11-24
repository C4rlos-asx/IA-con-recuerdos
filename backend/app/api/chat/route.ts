import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { messages, userId } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        const userMessage = lastMessage.content;

        // 1. Check Memory (Redis/DB)
        // In a real app, we'd fetch relevant memories here based on embeddings or keywords
        // const cachedContext = await redis.get(`context:${userId}`);

        // 2. Generate Response (Mocked for now)
        // Here you would call OpenAI or another LLM
        const botResponse = `Echo: ${userMessage} (Backend processed)`;

        // 3. Save Chat to DB (if userId is provided)
        if (userId) {
            // Ensure user exists or create one (simplified)
            let user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                // In a real app, creation might happen elsewhere
                // user = await prisma.user.create({ data: { id: userId, email: `user-${userId}@example.com` } });
            }

            if (user) {
                await prisma.chat.create({
                    data: {
                        userId: user.id,
                        messages: JSON.stringify([...messages, { role: 'assistant', content: botResponse }]),
                    },
                });
            }
        }

        // 4. Save to Memory (Optional/Simulated)
        // If the message contains "remember", we could save it to the Memory model
        if (userMessage.toLowerCase().includes('recuerda')) {
            // await prisma.memory.create(...)
        }

        return NextResponse.json({ role: 'assistant', content: botResponse });

    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
