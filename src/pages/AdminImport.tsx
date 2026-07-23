import { useState, useEffect } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

type ParsedRow = {
  name: string;
  category: string;
  price: number;
  image: string;
  _valid: boolean;
  _error?: string;
};

const REQUIRED_COLUMNS = ["name", "category", "price"];
const BATCH_SIZE = 500;

function parseAndValidate(rows: Record<string, string>[]): ParsedRow[] {
  return rows.map((row) => {
    const name = (row.name || "").trim();
    const category = (row.category || "").trim();
    const priceRaw = (row.price || "").trim();
    const image = (row.image || "").trim();
    const price = Number(priceRaw);

    if (!name) return { name, category, price, image, _valid: false, _error: "Missing name" };
    if (!category) return { name, category, price, image, _valid: false, _error: "Missing category" };
    if (!priceRaw || Number.isNaN(price) || price < 0) {
      return { name, category, price, image, _valid: false, _error: "Invalid price" };
    }

    return { name, category, price, image, _valid: true };
  });
}

const AdminImport = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error?.message || "Login failed");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRows([]);
    setFileName("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/#/admin`,
      });
      if (error) throw error;
      toast.success("Check your email for a password reset link.");
      setShowForgotPassword(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to send reset email.");
    } finally {
      setSendingReset(false);
    }
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setRows([]);
    setMissingColumns([]);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const columns = results.meta.fields?.map((f) => f.toLowerCase().trim()) || [];
        const missing = REQUIRED_COLUMNS.filter((col) => !columns.includes(col));
        if (missing.length > 0) {
          setMissingColumns(missing);
          return;
        }
        setRows(parseAndValidate(results.data));
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  const validRows = rows.filter((r) => r._valid);
  const invalidRows = rows.filter((r) => !r._valid);
  const categoryCounts = validRows.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setIsImporting(true);
    setImportProgress({ done: 0, total: validRows.length });

    try {
      const payload = validRows.map((r) => ({
        name: r.name,
        category: r.category,
        price: r.price,
        image: r.image || `https://placehold.co/600x750/e8ddd4/3a2f28?text=${encodeURIComponent(r.name)}`,
      }));

      let imported = 0;
      for (let i = 0; i < payload.length; i += BATCH_SIZE) {
        const batch = payload.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from("products").insert(batch);
        if (error) throw error;
        imported += batch.length;
        setImportProgress({ done: imported, total: payload.length });
      }

      toast.success(`Imported ${imported} product${imported === 1 ? "" : "s"} across ${Object.keys(categoryCounts).length} categories.`);
      setRows([]);
      setFileName("");
    } catch (error: any) {
      console.error("CSV IMPORT ERROR:", error);
      toast.error(`Import failed: ${error?.message || "Unknown error occurred"}`);
    } finally {
      setIsImporting(false);
    }
  };

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center pt-24 text-muted-foreground">Loading...</div>;
  }

  if (!session) {
    if (showForgotPassword) {
      return (
        <div className="min-h-screen flex items-center justify-center pt-24 px-4">
          <form onSubmit={handleForgotPassword} className="w-full max-w-sm space-y-5 border border-border p-8">
            <h1 className="font-heading text-2xl font-light">Reset Password</h1>
            <p className="font-body text-sm text-muted-foreground">
              Enter your admin email and we'll send a reset link.
            </p>
            <div>
              <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                Email
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={sendingReset}
              className="w-full font-body text-sm tracking-[0.2em] uppercase bg-accent text-accent-foreground py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sendingReset ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full font-body text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-primary"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5 border border-border p-8">
          <h1 className="font-heading text-2xl font-light">Admin Sign In</h1>
          <p className="font-body text-sm text-muted-foreground">
            Product import is restricted to signed-in admins. Create an admin user under Supabase → Authentication → Users.
          </p>
          <div>
            <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full font-body text-sm tracking-[0.2em] uppercase bg-accent text-accent-foreground py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loggingIn ? "Signing in..." : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setResetEmail(email);
              setShowForgotPassword(true);
            }}
            className="w-full font-body text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-primary"
          >
            Forgot Password?
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-light">Bulk Product Import</h1>
          <button onClick={handleLogout} className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-primary">
            Sign Out
          </button>
        </div>

        <div className="border border-border p-6 mb-6">
          <p className="font-body text-sm text-muted-foreground mb-4">
            Upload a CSV with columns <code className="text-foreground">name</code>,{" "}
            <code className="text-foreground">category</code>, <code className="text-foreground">price</code>, and
            optionally <code className="text-foreground">image</code> (a URL). Products are grouped into categories
            automatically based on whatever value is in the <code className="text-foreground">category</code> column —
            no need to predefine categories in code.
          </p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary py-10 cursor-pointer transition-colors">
            <span className="font-body text-sm text-muted-foreground">
              {fileName || "Click to choose a CSV file"}
            </span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        </div>

        {missingColumns.length > 0 && (
          <div className="border border-destructive/50 bg-destructive/5 p-4 mb-6 text-sm text-destructive">
            This CSV is missing required column(s): {missingColumns.join(", ")}
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="border border-border p-4">
                <div className="font-heading text-2xl">{validRows.length}</div>
                <div className="font-body text-xs uppercase tracking-widest text-muted-foreground">Valid rows</div>
              </div>
              <div className="border border-border p-4">
                <div className="font-heading text-2xl">{invalidRows.length}</div>
                <div className="font-body text-xs uppercase tracking-widest text-muted-foreground">Skipped rows</div>
              </div>
              <div className="border border-border p-4">
                <div className="font-heading text-2xl">{Object.keys(categoryCounts).length}</div>
                <div className="font-body text-xs uppercase tracking-widest text-muted-foreground">Categories</div>
              </div>
            </div>

            {Object.keys(categoryCounts).length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <span key={cat} className="font-body text-xs border border-border px-3 py-1.5">
                    {cat} <span className="text-muted-foreground">({count})</span>
                  </span>
                ))}
              </div>
            )}

            <div className="border border-border max-h-80 overflow-y-auto mb-6">
              <table className="w-full text-sm font-body">
                <thead className="sticky top-0 bg-background border-b border-border">
                  <tr>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-b border-border/50 ${!row._valid ? "text-destructive" : ""}`}>
                      <td className="p-3">{row._valid ? "✓" : `✕ ${row._error}`}</td>
                      <td className="p-3">{row.name || "—"}</td>
                      <td className="p-3">{row.category || "—"}</td>
                      <td className="p-3">{Number.isNaN(row.price) ? "—" : row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleImport}
              disabled={isImporting || validRows.length === 0}
              className="w-full bg-foreground text-background font-body uppercase tracking-[0.2em] text-xs py-4 hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isImporting
                ? `Importing ${importProgress.done}/${importProgress.total}...`
                : `Import ${validRows.length} product${validRows.length === 1 ? "" : "s"}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminImport;
