import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Category { id: string; name: string; slug: string }

export default function CategoryBar() {
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => { fetch("/api/categories").then(r=>r.json()).then(setCats).catch(()=>setCats([])); }, []);
  return (
    <nav className="bg-black text-white">
      <div className="container px-4 md:px-8">
        <ul className="flex items-center gap-6 overflow-x-auto py-2">
          {cats.map((c) => (
            <li key={c.id} className="shrink-0">
              <Link to={`/category/${c.slug}`} className="inline-flex items-center gap-2 text-sm hover:text-primary whitespace-nowrap">
                <span>{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
