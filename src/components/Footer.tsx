import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div>
          <h3 className="font-heading text-2xl font-light mb-4">Perrine</h3>
          <p className="font-body text-sm text-primary-foreground/60 leading-relaxed">
            Handcrafted bead artistry. Every piece tells a story, every bead a little stone of elegance.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-lg mb-4">Explore</h4>
          <div className="flex flex-col gap-2">
            {[
              { to: "/shop", label: "Collections" },
              { to: "/custom-orders", label: "Custom Orders" },
              { to: "/refurbishment", label: "Refurbishment" },
              { to: "/community", label: "Community" },
              { to: "/about", label: "Our Story" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="font-body text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg mb-4">Connect</h4>
          <div className="flex gap-4 mb-4">
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors" aria-label="Instagram">
              <Instagram size={20} />
            </a>
          </div>
          <p className="font-body text-sm text-primary-foreground/60">hello@perrine.com</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 text-center">
        <p className="font-body text-xs text-primary-foreground/40 tracking-widest uppercase">
          © {new Date().getFullYear()} Perrine. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
