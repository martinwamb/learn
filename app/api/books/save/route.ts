import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { externalId, source, title, author, coverUrl } = body;

  if (!externalId || !source || !title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const book = await db.book.upsert({
    where: { source_externalId: { source, externalId } },
    update: {},
    create: {
      externalId,
      source,
      title,
      author,
      coverUrl,
      audioStatus: "pending",
    },
  });

  return NextResponse.json({ bookId: book.id });
}
