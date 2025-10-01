import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductPage from "./pages/Product";
import Checkout from "./pages/Checkout";
import { I18nProvider } from "@/context/I18nContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CartProvider } from "@/context/CartContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import { ThemeProvider } from "@/context/ThemeContext";
import OrderSuccess from "./pages/OrderSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <I18nProvider>
        <CurrencyProvider>
          <ProductsProvider>
            <CartProvider>
              <AdminAuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<Admin />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
              </AdminAuthProvider>
            </CartProvider>
          </ProductsProvider>
        </CurrencyProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
