import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="text-8xl mb-6">📚</div>
        <h1 className="text-5xl font-bold text-orange-700 mb-4 leading-tight">
          Kujifunza ni Furaha!
        </h1>
        <p className="text-2xl text-orange-500 mb-2 font-medium">Learning is Fun!</p>
        <p className="text-gray-600 text-lg mb-10 max-w-md mx-auto">
          Lessons, stories, and books for Kenyan children — following the CBC curriculum.
          PP1 all the way to Grade 3!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/signin"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg transition-all hover:scale-105"
          >
            Start Learning
          </Link>
          <Link
            href="/library"
            className="bg-white hover:bg-orange-50 text-orange-600 font-bold py-4 px-10 rounded-full text-xl shadow border-2 border-orange-200 transition-all hover:scale-105"
          >
            Browse Books
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { emoji: "🧮", label: "Maths" },
            { emoji: "📖", label: "English" },
            { emoji: "🇰🇪", label: "Kiswahili" },
            { emoji: "🌍", label: "Social Studies" },
            { emoji: "🎨", label: "Creative Arts" },
            { emoji: "🌿", label: "Environment" },
          ].map(({ emoji, label }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow text-center">
              <div className="text-3xl mb-1">{emoji}</div>
              <div className="text-sm font-medium text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
