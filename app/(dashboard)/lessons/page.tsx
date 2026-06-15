import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function LessonsIndex() {
  const session = await auth();
  const profile = await db.userProfile.findUnique({ where: { userId: session!.user!.id } });
  redirect(`/lessons/${profile?.gradeCode ?? "G1"}`);
}
