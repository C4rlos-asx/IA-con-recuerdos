import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET - List all custom models for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        const customModels = await prisma.customModel.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(customModels, { headers: corsHeaders });
    } catch (error) {
        console.error('Error fetching custom models:', error);
        return NextResponse.json(
            { error: 'Failed to fetch custom models' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST - Create a new custom model
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, name, description, instructions, baseModelId, baseModelName, provider } = body;

        if (!userId || !name || !instructions || !baseModelId || !baseModelName || !provider) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400, headers: corsHeaders }
            );
        }

        const customModel = await prisma.customModel.create({
            data: {
                userId,
                name,
                description: description || null,
                instructions,
                baseModelId,
                baseModelName,
                provider,
            },
        });

        return NextResponse.json(customModel, { status: 201, headers: corsHeaders });
    } catch (error) {
        console.error('Error creating custom model:', error);
        return NextResponse.json(
            { error: 'Failed to create custom model' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// PUT - Update a custom model
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, userId, name, description, instructions, baseModelId, baseModelName, provider } = body;

        if (!id || !userId) {
            return NextResponse.json(
                { error: 'id and userId are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Verify ownership
        const existing = await prisma.customModel.findUnique({
            where: { id },
        });

        if (!existing || existing.userId !== userId) {
            return NextResponse.json(
                { error: 'Custom model not found or unauthorized' },
                { status: 404, headers: corsHeaders }
            );
        }

        const customModel = await prisma.customModel.update({
            where: { id },
            data: {
                name: name || existing.name,
                description: description !== undefined ? description : existing.description,
                instructions: instructions || existing.instructions,
                baseModelId: baseModelId || existing.baseModelId,
                baseModelName: baseModelName || existing.baseModelName,
                provider: provider || existing.provider,
            },
        });

        return NextResponse.json(customModel, { headers: corsHeaders });
    } catch (error) {
        console.error('Error updating custom model:', error);
        return NextResponse.json(
            { error: 'Failed to update custom model' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// DELETE - Delete a custom model
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const userId = searchParams.get('userId');

        if (!id || !userId) {
            return NextResponse.json(
                { error: 'id and userId are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Verify ownership
        const existing = await prisma.customModel.findUnique({
            where: { id },
        });

        if (!existing || existing.userId !== userId) {
            return NextResponse.json(
                { error: 'Custom model not found or unauthorized' },
                { status: 404, headers: corsHeaders }
            );
        }

        await prisma.customModel.delete({
            where: { id },
        });

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error) {
        console.error('Error deleting custom model:', error);
        return NextResponse.json(
            { error: 'Failed to delete custom model' },
            { status: 500, headers: corsHeaders }
        );
    }
}
