import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container px-6 md:px-8 pt-6 md:pt-8">{children}</main>
      <Footer />
    </div>
  );
}
