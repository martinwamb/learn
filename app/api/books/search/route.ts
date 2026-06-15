import { NextResponse } from "next/server";
import { searchOpenLibrary } from "@/lib/books/open-library";
import { searchGutenberg } from "@/lib/books/gutenberg";
import { searchAfricanStorybook } from "@/lib/books/african-storybook";
import { searchStoryweaver } from "@/lib/books/storyweaver";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const source = searchParams.get("source") ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  try {
    const results = await (async () => {
      switch (source) {
        case "open-library":
          return (await searchOpenLibrary(q || "children stories", page)).map((b) => ({
            externalId: b.key,
            source: "open-library",
            title: b.title,
            author: b.author_name?.[0],
            coverUrl: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null,
          }));
        case "gutenberg":
          return (await searchGutenberg(q || "fairy tales", page)).map((b) => ({
            externalId: String(b.id),
            source: "gutenberg",
            title: b.title,
            author: b.authors[0]?.name,
            coverUrl: b.formats["image/jpeg"] ?? null,
          }));
        case "african-storybook":
          return (await searchAfricanStorybook(q)).map((b) => ({
            externalId: b.id,
            source: "african-storybook",
            title: b.title,
            author: b.author,
            coverUrl: b.cover_image ?? null,
          }));
        case "storyweaver":
          return (await searchStoryweaver(q, "English", page)).map((b) => ({
            externalId: String(b.id),
            source: "storyweaver",
            title: b.title,
            author: b.author,
            coverUrl: b.cover_image,
          }));
        default: {
          const [ol, asb, sw] = await Promise.all([
            searchOpenLibrary(q || "african children stories", 1),
            searchAfricanStorybook(q),
            searchStoryweaver(q, "English", 1),
          ]);
          return [
            ...asb.slice(0, 4).map((b) => ({ externalId: b.id, source: "african-storybook", title: b.title, author: b.author, coverUrl: b.cover_image ?? null })),
            ...ol.slice(0, 4).map((b) => ({ externalId: b.key, source: "open-library", title: b.title, author: b.author_name?.[0], coverUrl: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null })),
            ...sw.slice(0, 4).map((b) => ({ externalId: String(b.id), source: "storyweaver", title: b.title, author: b.author, coverUrl: b.cover_image })),
          ];
        }
      }
    })();

    return NextResponse.json({ books: results });
  } catch (err) {
    console.error("Book search error:", err);
    return NextResponse.json({ books: [] });
  }
}
