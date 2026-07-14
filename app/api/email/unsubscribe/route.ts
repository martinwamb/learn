import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/email/token";

function htmlPage(message: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;margin:80px auto;padding:24px;text-align:center;color:#374151">
      <div style="font-size:48px">🦒</div>
      <h1 style="font-size:20px">${message}</h1>
      <a href="https://learn.wambugumartin.com/dashboard" style="color:#f97316">Back to Learn</a>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  if (!userId || !token || !verifyUnsubscribeToken(userId, token)) {
    return htmlPage("This unsubscribe link isn't valid.");
  }

  await db.userProfile.updateMany({
    where: { userId },
    data: { emailOptIn: false },
  });

  return htmlPage("You've been unsubscribed from Learn Platform emails.");
}
