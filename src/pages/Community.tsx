import { useState } from "react";
import { Upload, Heart } from "lucide-react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import productClutch from "@/assets/product-clutch.jpg";
import productEvening from "@/assets/product-evening-bag.jpg";
import aboutCraft from "@/assets/about-craft.jpg";
import heroBag from "@/assets/hero-bag.jpg";

const galleryItems = [
  { id: 1, image: productClutch, name: "Sarah M.", caption: "Date night with my Rosé Clutch ✨", likes: 24 },
  { id: 2, image: heroBag, caption: "Wedding season ready!", name: "Amara K.", likes: 42 },
  { id: 3, image: productEvening, caption: "My go-to evening bag", name: "Jade L.", likes: 18 },
  { id: 4, image: aboutCraft, caption: "Behind the scenes at Perrine", name: "Perrine", likes: 67 },
];

const Community = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [likeCounts, setLikeCounts] = useState(
    Object.fromEntries(galleryItems.map((item) => [item.id, item.likes]))
  );

  const toggleLike = (id: number) => {
    const alreadyLiked = likedIds.includes(id);
    setLikedIds(alreadyLiked ? likedIds.filter((i) => i !== id) : [...likedIds, id]);
    setLikeCounts((prev) => ({ ...prev, [id]: prev[id] + (alreadyLiked ? -1 : 1) }));
  };
  const [shareName, setShareName] = useState("");
  const [shareCaption, setShareCaption] = useState("");
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShareSubmit = async () => {
    if (!shareName.trim() || !shareCaption.trim()) {
      toast.error("Please add your name and a caption.");
      return;
    }
    setIsSubmitting(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: shareName.trim(),
          from_name: shareName.trim(),
          customer_name: shareName.trim(),
          message: `New community lookbook submission\n\nCaption: ${shareCaption.trim()}\nMedia attached: ${shareFile ? shareFile.name : "none"}`,
        },
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }
      );
      toast.success("Thanks for sharing! We'll review it for the lookbook.");
      setShareName("");
      setShareCaption("");
      setShareFile(null);
      setShowUpload(false);
    } catch (error: any) {
      console.error("COMMUNITY SHARE SUBMIT ERROR:", error);
      toast.error(`Failed to submit: ${error?.message || error?.text || "Unknown error occurred"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl md:text-6xl text-center font-light tracking-wide mb-4 animate-fade-up">
          Community Lookbook
        </h1>
        <p className="font-body text-center text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          See how our community styles their Perrine pieces.
        </p>

        <div className="text-center mb-16 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center gap-2 font-body text-sm tracking-[0.2em] uppercase border border-border px-8 py-3 hover:border-primary hover:text-primary transition-all"
          >
            <Upload size={16} /> Share Your Look
          </button>
        </div>

        {showUpload && (
          <div className="max-w-lg mx-auto mb-16 p-8 border border-border bg-card animate-fade-up">
            <h3 className="font-heading text-xl mb-4">Share Your Perrine Moment</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={shareName}
                onChange={(e) => setShareName(e.target.value)}
                className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none transition-colors"
              />
              <textarea
                placeholder="Tell us about this moment..."
                rows={3}
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm focus:border-primary focus:outline-none transition-colors resize-none"
              />
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary py-8 cursor-pointer transition-colors">
                <Upload size={20} className="text-muted-foreground mb-2" />
                <span className="font-body text-sm text-muted-foreground">
                  {shareFile ? shareFile.name : "Upload photo or video"}
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => setShareFile(e.target.files?.[0] || null)}
                />
              </label>
              <button
                onClick={handleShareSubmit}
                disabled={isSubmitting}
                className="w-full font-body text-sm tracking-[0.2em] uppercase bg-accent text-accent-foreground py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}

        {/* Gallery */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryItems.map((item, i) => (
            <div
              key={item.id}
              className="break-inside-avoid group animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.caption}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-heading text-sm">{item.name}</span>
                  <button
                    onClick={() => toggleLike(item.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      likedIds.includes(item.id) ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <Heart size={14} fill={likedIds.includes(item.id) ? "currentColor" : "none"} />
                    <span className="font-body text-xs">{likeCounts[item.id]}</span>
                  </button>
                </div>
                <p className="font-body text-xs text-muted-foreground">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
