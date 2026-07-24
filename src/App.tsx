import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Refurbishment from "./pages/Refurbishment";
import CustomOrders from "./pages/CustomOrders";
import Community from "./pages/Community";
import AdminImport from "./pages/AdminImport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Supabase's password-reset email links carry the recovery token as a URL hash
// fragment (e.g. #access_token=...&type=recovery). Since this app uses HashRouter
// for routing, that fragment collides with route matching and the link would
// otherwise 404. Catching the PASSWORD_RECOVERY event here, above the router,
// means the reset form always appears regardless of what the mangled URL matches.
const PasswordRecoveryOverlay = ({ onDone }: { onDone: () => void }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated — you're signed in.");
      window.location.hash = "/admin";
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update password."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 border border-border p-8">
        <h1 className="font-heading text-2xl font-light">Set a New Password</h1>
        <div>
          <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
            New Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
            Confirm Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full font-body text-sm tracking-[0.2em] uppercase bg-accent text-accent-foreground py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Password"}
        </button>
      </form>
    </div>
  );
};

const App = () => {
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (recoveryMode) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <PasswordRecoveryOverlay onDone={() => setRecoveryMode(false)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <HashRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/refurbishment" element={<Refurbishment />} />
            <Route path="/custom-orders" element={<CustomOrders />} />
            <Route path="/community" element={<Community />} />
            <Route path="/admin" element={<AdminImport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;