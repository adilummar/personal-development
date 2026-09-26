import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const transactions = await Transaction.find({ user: (session.user as any).id }).sort({ date: -1, createdAt: -1 });

    return NextResponse.json({ transactions }, { status: 200 });
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

    const { amount, type, account, category, party, description, date } = await req.json();

    if (!amount || !type || !account || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const targetDate = date ? new Date(date) : new Date();

    const transaction = await Transaction.create({
      user: (session.user as any).id,
      amount: Number(amount),
      type,
      account,
      category,
      party,
      description,
      date: targetDate,
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
