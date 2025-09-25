// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - barcha tasklarni olish
export async function GET() {
  try {
    console.log('GET /api/tasks called'); // Debug
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }
    })
    console.log('Found tasks:', tasks.length); // Debug
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('GET /api/tasks error:', error); // Debug
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST - yangi task yaratish
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/tasks called'); // Debug
    const body = await request.json()
    console.log('Request body:', body); // Debug
    
    const { text } = body
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.log('Invalid text:', text); // Debug
      return NextResponse.json(
        { error: 'Task text is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        text: text.trim(),
        completed: false
      }
    })

    console.log('Task created:', task); // Debug
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error); // Debug
    
    // Error message'ni safely olish
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { error: 'Failed to create task', details: errorMessage },
      { status: 500 }
    )
  }
}