import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// DELETE endpoint to delete a chat
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const chatId = searchParams.get('chatId');

        if (!chatId) {
            return NextResponse.json(
                { error: 'chatId is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        await prisma.chat.delete({
            where: { id: chatId }
        });

        return NextResponse.json(
            { success: true },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error('Error in DELETE /api/chat/manage:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// PATCH endpoint to rename a chat
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { chatId, title } = body;

        if (!chatId || !title) {
            return NextResponse.json(
                { error: 'chatId and title are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        const updatedChat = await prisma.chat.update({
            where: { id: chatId },
            data: { title }
        });

        return NextResponse.json(
            { success: true, chat: updatedChat },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error('Error in PATCH /api/chat/manage:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
