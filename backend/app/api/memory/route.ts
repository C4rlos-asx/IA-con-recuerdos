import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// CORS headers helper (mismo comportamiento que /api/chat)
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
        const { userId, content } = body;

        if (!userId || !content) {
            return NextResponse.json(
                { error: 'Missing userId or content' },
                { status: 400, headers: corsHeaders }
            );
        }

        const memory = await prisma.memory.create({
            data: {
                userId,
                content,
            },
        });

        return NextResponse.json(memory, { headers: corsHeaders });
    } catch (error) {
        console.error('Error saving memory:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                {
                    message: 'Este endpoint requiere un userId',
                    description: 'Para usar este API, envía una petición GET con el siguiente formato:',
                    example: {
                        url: '/api/memory?userId=test-user',
                        method: 'GET'
                    },
                    error: 'Missing userId'
                },
                { status: 200, headers: corsHeaders }
            );
        }

        const memories = await prisma.memory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(memories, { headers: corsHeaders });
    } catch (error) {
        console.error('Error fetching memories:', error);
        return NextResponse.json(
            { 
                error: 'Internal Server Error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500, headers: corsHeaders }
        );
    }
}
