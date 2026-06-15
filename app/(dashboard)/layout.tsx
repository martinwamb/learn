import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/signin");

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-orange-100 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-orange-700 text-xl">
          <span>📚</span>
          <span>Learn</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-gray-600 hover:text-orange-600 transition-colors hidden sm:block">
            Home
          </Link>
          <Link href="/lessons" className="text-gray-600 hover:text-orange-600 transition-colors">
            Lessons
          </Link>
          <Link href="/library" className="text-gray-600 hover:text-orange-600 transition-colors">
            Books
          </Link>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {session.user?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-gray-500 text-xs hidden sm:block">Sign out</span>
            </button>
          </form>
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}
