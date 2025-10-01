import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Layout>
      <div className="text-center py-10">
        <h1 className="text-2xl font-extrabold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
        <div className="mt-4"><Link to="/" className="underline">Go home</Link></div>
      </div>
    </Layout>
  );
}
