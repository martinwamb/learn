import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveBook } from "@/lib/books/save";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { externalId, source, title, author, coverUrl } = body;

  if (!externalId || !source || !title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const book = await saveBook(db, { externalId, source, title, author, coverUrl });

  return NextResponse.json({ bookId: book.id });
}
