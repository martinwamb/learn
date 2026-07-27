import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function StoriesIndex() {
  const session = await auth();
  const profile = await db.userProfile.findUnique({ where: { userId: session!.user!.id } });
  redirect(`/stories/${profile?.gradeCode ?? "G1"}`);
}
