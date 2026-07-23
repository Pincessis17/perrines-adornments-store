import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import FloatingBeads from "@/components/FloatingBeads";

const CustomOrders = () => {
  const [form, setForm] = useState({ name: "", email: "", description: "", budget: "", timeline: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const message = `Custom order request\n\nDescription: ${form.description.trim()}\nBudget: ${form.budget || "Not specified"}\nTimeline: ${form.timeline || "Not specified"}\nReference images attached: ${files.length}`;

      // Note: EmailJS's free tier sends text only, so reference images aren't attached here —
      // just noted as a count. Swap in an upload-to-Supabase-Storage step if you need the files themselves.
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: form.name.trim(),
          from_name: form.name.trim(),
          customer_name: form.name.trim(),
          email: form.email.trim(),
          reply_to: form.email.trim(),
          message,
        },
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }
      );

      toast.success("Custom order request received! We'll reach out within 48 hours.");
      setForm({ name: "", email: "", description: "", budget: "", timeline: "" });
      setFiles([]);
    } catch (error: any) {
      console.error("CUSTOM ORDER SUBMIT ERROR:", error);
      toast.error(`Failed to send request: ${error?.message || error?.text || "Unknown error occurred"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="relative py-24 bg-blush overflow-hidden mb-16">
        <FloatingBeads />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="font-heading text-4xl md:text-7xl font-light tracking-wide mb-4 animate-fade-up">
            Custom Orders
          </h1>
          <p className="font-heading text-lg italic text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Dream it, describe it, and our artisans will bring it to life — bead by beautiful bead.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { key: "name", label: "Your Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
          ].map((f) => (
            <div key={f.key} className="animate-fade-up">
              <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">{f.label}</label>
              <input
                type={f.type}
                required
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          ))}

          <div className="animate-fade-up">
            <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
              Describe Your Vision
            </label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell us about the piece you envision — colors, size, style, occasion..."
              className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-muted-foreground/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-up">
            <div>
              <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">Budget Range</label>
              <select
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none transition-colors"
              >
                <option value="">Select range</option>
                <option value="100-250">$100 – $250</option>
                <option value="250-500">$250 – $500</option>
                <option value="500+">$500+</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">Timeline</label>
              <select
                value={form.timeline}
                onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none transition-colors"
              >
                <option value="">Select timeline</option>
                <option value="2-3 weeks">2–3 weeks</option>
                <option value="1 month">1 month</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          {/* File upload */}
          <div className="animate-fade-up">
            <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
              Reference Images (optional)
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary py-10 cursor-pointer transition-colors">
              <Upload size={24} className="text-muted-foreground mb-2" />
              <span className="font-body text-sm text-muted-foreground">
                {files.length > 0 ? `${files.length} file(s) selected` : "Click to upload reference images"}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-body text-sm tracking-[0.2em] uppercase bg-accent text-accent-foreground py-4 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? "Submitting..." : "Submit Custom Order Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomOrders;
