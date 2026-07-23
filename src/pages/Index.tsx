import { Link } from "react-router-dom";
import heroBag from "@/assets/hero-bag.jpg";
import productClutch from "@/assets/product-clutch.jpg";
import productBelt from "@/assets/product-belt.jpg";
import productAccessories from "@/assets/product-accessories.jpg";
import productEvening from "@/assets/product-evening-bag.jpg";
import FloatingBeads from "@/components/FloatingBeads";

const collections = [
  { title: "Bags", image: productClutch, link: "/shop?category=bags" },
  { title: "Belts", image: productBelt, link: "/shop?category=belts" },
  { title: "Accessories", image: productAccessories, link: "/shop?category=accessories" },
  { title: "Evening", image: productEvening, link: "/shop?category=bags" },
];

const Index = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBag} alt="Perrine handcrafted beaded bag" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/30" />
      </div>
      <FloatingBeads />
      <div className="relative z-10 text-center px-4">
        <h1 className="font-heading text-5xl md:text-8xl font-light text-primary-foreground tracking-wider animate-fade-up">
          Perrine
        </h1>
        <p className="font-heading text-lg md:text-2xl text-primary-foreground/80 mt-4 italic animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Handcrafted Bead Artistry
        </p>
        <div className="mt-10 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <Link
            to="/shop"
            className="inline-block font-body text-sm tracking-[0.2em] uppercase text-primary-foreground border border-primary-foreground/50 px-10 py-4 hover:bg-primary-foreground hover:text-foreground transition-all duration-500"
          >
            Explore Collections
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>

    {/* Tagline */}
    <section className="py-24 text-center px-4">
      <p className="font-heading text-2xl md:text-4xl font-light text-foreground/80 max-w-3xl mx-auto leading-relaxed">
        Every bead, a <span className="italic text-primary">petite pierre</span> — carefully placed to create something extraordinary.
      </p>
    </section>

    {/* Featured Collections */}
    <section className="container mx-auto px-4 pb-24">
      <h2 className="font-heading text-3xl md:text-5xl text-center mb-16 font-light tracking-wide">
        Collections
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {collections.map((col, i) => (
          <Link
            key={col.title}
            to={col.link}
            className="group relative overflow-hidden aspect-[3/4] animate-fade-up"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <img
              src={col.image}
              alt={col.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/30 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="font-heading text-2xl text-primary-foreground tracking-wider">
                {col.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="bg-blush py-24 text-center px-4 relative overflow-hidden">
      <FloatingBeads />
      <div className="relative z-10">
        <h2 className="font-heading text-3xl md:text-5xl font-light mb-6">Bespoke Creations</h2>
        <p className="font-body text-muted-foreground max-w-xl mx-auto mb-10">
          Dream it, and we'll bead it. Our artisans craft one-of-a-kind pieces tailored to your vision.
        </p>
        <Link
          to="/custom-orders"
          className="inline-block font-body text-sm tracking-[0.2em] uppercase bg-accent text-accent-foreground px-10 py-4 hover:opacity-90 transition-opacity"
        >
          Request Custom Order
        </Link>
      </div>
    </section>
  </div>
);

export default Index;
