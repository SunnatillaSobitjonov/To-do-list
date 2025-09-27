// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - update task
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }, // <-- Promise bo'lishi kerak
) {
  try {
    const { id } = await context.params; // Promise'dan chiqarib olish
    const taskId = parseInt(id, 10);
    const body = await request.json();

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: body,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

// DELETE - delete task
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }, // <-- bu yerda ham Promise
) {
  try {
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
