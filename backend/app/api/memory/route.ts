import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, content } = body;

        if (!userId || !content) {
            return NextResponse.json({ error: 'Missing userId or content' }, { status: 400 });
        }

        const memory = await prisma.memory.create({
            data: {
                userId,
                content,
            },
        });

        return NextResponse.json(memory);
    } catch (error) {
        console.error('Error saving memory:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const memories = await prisma.memory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(memories);
    } catch (error) {
        console.error('Error fetching memories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
