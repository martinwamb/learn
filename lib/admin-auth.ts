import { auth } from "@/lib/auth";

export async function isAdminSession(): Promise<boolean> {
  const session = await auth();
  return !!session?.user?.email && session.user.email === process.env.ADMIN_EMAIL;
}

// For server actions: actions are directly callable POST endpoints once their
// action ID is known client-side, so every admin action must re-check this
// itself -- gating only the page's render isn't enough.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) {
    throw new Error("Not authorized");
  }
}
