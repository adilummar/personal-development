import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Task from "@/models/Task";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    
    await connectDB();

    let query: any = { user: (session.user as any).id };

    if (dateParam) {
      // Create start and end of the requested day (local time approx)
      const targetDate = new Date(dateParam);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      query.dueDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, category, dueDate } = await req.json();

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    await connectDB();

    // If no due date is provided, default to today
    const targetDate = dueDate ? new Date(dueDate) : new Date();

    const task = await Task.create({
      user: (session.user as any).id,
      title,
      description,
      category: category || "Today",
      dueDate: targetDate,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
