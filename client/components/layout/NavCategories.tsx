import { Link } from "react-router-dom";
import { useCategories } from "@/context/CategoriesContext";

export default function NavCategories() {
  const { categories } = useCategories();
  if (!categories.length) return null;
  return (
    <ul className="hidden md:flex items-center gap-6 ml-2 text-sm text-muted-foreground">
      {categories.map((c)=> (
        <li key={c.id}><Link to={`/c/${c.slug}`} className="hover:text-foreground flex items-center gap-2">{c.name}</Link></li>
      ))}
    </ul>
  );
}
