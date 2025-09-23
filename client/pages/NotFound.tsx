import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Layout>
      <div className="py-20 text-center">
        <h1 className="text-3xl font-extrabold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
        <div className="mt-6">
          <Link to="/" className="px-5 py-2 rounded-2xl bg-primary text-primary-foreground font-semibold">Go home</Link>
        </div>
      </div>
    </Layout>
  );
}
