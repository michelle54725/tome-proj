import { useCallback, useMemo } from "react";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Demo" },
    { name: "description", content: "Demo for Tome Take-Home Challenge" },
  ];
}

interface Book {
  id: string;
  title: string;
  author: string;
  format: "PRINT" | "AUDIO";
  coverPhoto: string;
  publishedAt: number;
}

const formFields = [
  {
    title: "Title",
    name: "title",
    placeholder: "All About Love",
    type: "text",
  },
  {
    title: "Author",
    name: "author",
    placeholder: "bell hooks",
    type: "text",
  },
  {
    title: "Cover Photo",
    name: "coverPhoto",
    placeholder: "url",
    type: "text",
  },
  {
    title: "Published At",
    name: "publishedAt",
    placeholder: "YYYY-MM-DD",
    type: "text",
  },
  {
    title: "Print",
    name: "format",
    type: "radio",
    value: "PRINT",
  },
  {
    title: "Audiobook",
    name: "format",
    type: "radio",
    value: "AUDIO",
  },
];

export default function Home() {
  const data: Book[] = useMemo(() => {
    return [...Array(5)].map(
      (_, index) =>
        ({
          id: `${index}`,
          title: `Test Book ${index}`,
          author: `Author ${index}`,
          format: "PRINT",
          coverPhoto:
            "https://assets.rebelmouse.io/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbWFnZSI6Imh0dHBzOi8vYXNzZXRzLnJibC5tcy80MTUzNTA1L29yaWdpbi5qcGciLCJleHBpcmVzX2F0IjoxNzg4MTU0MzU4fQ.9tgenEDjvGDotL9GwsmPKk1aBhVuxpt5GVjSITgU4rs/img.jpg?width=980",
          publishedAt: 1735689600000,
        } satisfies Book)
    );
  }, []);

  const onSubmit = useCallback((input: FormData) => {
    const title = input.get("title");
    const author = input.get("author");
    const format = input.get("format");
    const coverPhoto = input.get("coverPhoto");
    const publishedAt = input.get("publishedAt");

    if (!title || !author) {
      alert("Error: must include title and author");
      return;
    }

    alert(
      `Title: ${title}\nAuthor: ${author} \nCoverPhoto: ${coverPhoto} \nFormat: ${format} \nPublished At: ${publishedAt}`
    );
  }, []);

  const onSearch = useCallback((input: FormData) => {
    const search = input.get("search");
    alert(`Search: ${search}`);
  }, []);

  return (
    <main className="flex flex-col gap-y-8 items-center justify-center pt-16 pb-4">
      <p className="leading-6 text-xl text-black-800 text-center">Demo</p>

      <form action={onSubmit}>
        {formFields.map(({ title, name, placeholder, type, value }) => (
          <label key={title}>
            {title}
            <input
              name={name}
              placeholder={placeholder}
              type={type}
              value={value}
            />
          </label>
        ))}
        <button type="submit" className="border rounded-xl p-2">
          Add book
        </button>
      </form>

      <form action={onSearch}>
        <label>
          Search
          <input name="search" />
        </label>
        <button type="submit" className="border rounded-xl p-2">
          Search for book
        </button>
      </form>

      <ul className="flex flex-wrap">
        {data.map((book) => (
          <li key={book.id} className="m-4 border rounded-sm p-4">
            <p>Title: {book.title}</p>
            <p>Author: {book.author}</p>
            <p>Format: {book.format}</p>
            <p>
              Published At:{" "}
              {`${new Date(book.publishedAt).toISOString().split("T")[0]}`}
            </p>
            <div style={{ height: 100, width: 100 }}>
              <img src={book.coverPhoto} alt={book.title} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
