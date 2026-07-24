import { useState } from "react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import refurbishmentImg from "@/assets/refurbishment.jpg";
import { getErrorMessage } from "@/lib/utils";

const Refurbishment = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", description: "", itemType: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const message = `Refurbishment request\n\nItem type: ${form.itemType}\nPhone: ${form.phone.trim()}\nDescription: ${form.description.trim()}`;

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

      toast.success("Refurbishment request submitted! We'll be in touch within 48 hours.");
      setForm({ name: "", email: "", phone: "", description: "", itemType: "" });
    } catch (error) {
      console.error("REFURBISHMENT SUBMIT ERROR:", error);
      toast.error(`Failed to submit request: ${getErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden mb-16">
        <img src={refurbishmentImg} alt="Refurbishment service" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/40" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-heading text-4xl md:text-7xl font-light text-primary-foreground tracking-wide animate-fade-up">
            Refurbishment
          </h1>
          <p className="font-heading text-lg text-primary-foreground/80 italic mt-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Restore your beloved Perrine piece to its original glory
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Info */}
          <div className="animate-fade-up">
            <h2 className="font-heading text-3xl font-light mb-6">How It Works</h2>
            <div className="space-y-6">
              {[
                { step: "01", title: "Submit a Request", desc: "Fill out the form with details about your piece and what needs attention." },
                { step: "02", title: "Assessment", desc: "Our artisans will review your request and provide a quote within 48 hours." },
                { step: "03", title: "Send Your Piece", desc: "Ship your item to our studio for careful restoration." },
                { step: "04", title: "Restoration", desc: "Our skilled artisans restore your piece bead by bead, returning it to its original beauty." },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <span className="font-heading text-2xl text-primary/40">{s.step}</span>
                  <div>
                    <h3 className="font-heading text-lg mb-1">{s.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="font-heading text-3xl font-light mb-2">Request Refurbishment</h2>
            {[
              { key: "name", label: "Name", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Phone", type: "tel" },
            ].map((f) => (
              <div key={f.key}>
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
            <div>
              <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">Item Type</label>
              <select
                required
                value={form.itemType}
                onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none transition-colors"
              >
                <option value="">Select item type</option>
                <option value="bag">Bag</option>
                <option value="belt">Belt</option>
                <option value="accessory">Accessory</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">Description of Issue</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-body text-sm tracking-[0.2em] uppercase bg-accent text-accent-foreground py-4 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Refurbishment;
