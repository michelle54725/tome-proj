import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [data, setData] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(async (input: FormData) => {
    const title = input.get("title")?.toString();
    const author = input.get("author")?.toString();
    const coverPhoto = input.get("coverPhoto")?.toString();
    const _publishedAt = input.get("publishedAt")?.toString();
    const publishedAt = _publishedAt ? new Date(_publishedAt) : null;
    const format = input.get("format")?.toString();

    if (!title || !author) {
      alert("Error: must include title and author");
      return;
    }

    if (publishedAt !== null && isNaN(publishedAt.getTime())) {
      alert(
        "Error: Invalid date for Published At. Must be in YYYY-MM-DD format."
      );
      return;
    }

    const bookData = {
      title,
      author,
      coverPhoto,
      publishedAt,
      format,
    };

    const res = await fetch(`${process.env.API_URL}/book/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookData),
    });

    const book = await res.json();

    alert(`Book added successfully:\n ${JSON.stringify(book, null, 2)}`);
  }, []);

  const onSearch = useCallback(async (input: FormData) => {
    try {
      setLoading(true);
      const search = input.get("search");
      const res = await fetch(`${process.env.API_URL}/book?search=${search}`);
      const data = await res.json();
      setData(data.books);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.API_URL}/book`);
        const data = await res.json();
        if (data?.books) {
          setData(data.books);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    initialFetch();
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
          <input name="search" placeholder="empty search = all books" />
        </label>
        <button type="submit" className="border rounded-xl p-2">
          Search for book
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {data.length > 0 ? (
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
              {book.coverPhoto ? (
                <div style={{ height: 100, width: 100 }}>
                  <img src={book.coverPhoto} alt={book.title} />
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "gray" }}>
                  No cover photo found
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No books found</p>
      )}
    </main>
  );
}
