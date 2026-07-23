import aboutCraft from "@/assets/about-craft.jpg";
import FloatingBeads from "@/components/FloatingBeads";

const About = () => (
  <div className="min-h-screen pt-24">
    {/* Hero */}
    <section className="relative py-24 bg-blush overflow-hidden">
      <FloatingBeads />
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="font-heading text-4xl md:text-7xl font-light tracking-wide mb-6 animate-fade-up">
          Our Story
        </h1>
        <p className="font-heading text-xl italic text-muted-foreground animate-fade-up" style={{ animationDelay: "0.2s" }}>
          "Perrine" — from the French, meaning "little stone"
        </p>
      </div>
    </section>

    {/* Content */}
    <section className="container mx-auto px-4 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="animate-fade-up">
          <img src={aboutCraft} alt="Artisan crafting beaded bag" className="w-full aspect-[4/3] object-cover" />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="font-heading text-3xl md:text-4xl font-light mb-6">Every Bead Has a Purpose</h2>
          <div className="space-y-4 font-body text-sm text-muted-foreground leading-relaxed">
            <p>
              Perrine was born from a love for the delicate, the intricate, and the handmade. Each piece is a 
              meditation in patience — bead by bead, stitch by stitch — creating accessories that are as 
              meaningful as they are beautiful.
            </p>
            <p>
              The name Perrine, derived from the French word for "little stone," embodies our philosophy: 
              that something small and precious, when combined with care and intention, can become 
              something truly extraordinary.
            </p>
            <p>
              We believe in slow fashion — in pieces that are crafted to last, to be treasured, and to tell 
              a story. Every Perrine creation is made by hand, ensuring that no two pieces are ever quite the same.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="bg-cream py-24">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl md:text-4xl text-center font-light mb-16">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Artisanship", desc: "Every piece is handcrafted by skilled artisans using traditional beading techniques passed down through generations." },
            { title: "Sustainability", desc: "We source ethically and create pieces designed to last a lifetime, not a season." },
            { title: "Community", desc: "Perrine is more than a brand — it's a community of women who celebrate craftsmanship and individuality." },
          ].map((v, i) => (
            <div key={v.title} className="text-center animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <h3 className="font-heading text-2xl mb-4">{v.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default About;
