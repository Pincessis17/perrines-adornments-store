import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

const DEFAULT_CATEGORIES = ["All", "Bags", "Belts", "Accessories", "Custom Orders"];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [active, setActive] = useState<string>("All");
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [orderName, setOrderName] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const [orderWhatsapp, setOrderWhatsapp] = useState("");
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        if (data) {
          setProducts(data);
        }
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchProducts();
  }, []);

  // Category list is derived from whatever's actually in the database (plus "All"),
  // so newly-imported categories (e.g. via CSV upload) show up as filters automatically.
  const categories = useMemo(() => {
    const fromProducts = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ).sort();
    const merged = fromProducts.length > 0 ? fromProducts : DEFAULT_CATEGORIES.slice(1);
    return ["All", ...merged];
  }, [products]);

  useEffect(() => {
    if (urlCategory) {
      const match = categories.find((c) => c.toLowerCase() === urlCategory.toLowerCase());
      if (match) setActive(match);
    }
  }, [urlCategory, categories]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProduct(null);
        setOrderQuantity(1);
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered =
    active === "All"
      ? products
      : products.filter((p) => p.category === active);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl md:text-6xl text-center mb-4 font-light tracking-wide">
          Collections
        </h1>

        <p className="font-body text-center text-muted-foreground mb-12">
          Handcrafted with intention. Each piece is unique.
        </p>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`font-body text-xs tracking-[0.2em] uppercase px-6 py-2.5 border transition-all duration-300 ${active === cat
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="group cursor-pointer flex flex-col active:scale-[0.98] transition-all duration-200"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="bg-secondary/20 aspect-[4/5] overflow-hidden mb-5 rounded-sm">
                <img
                  src={`${product.image}?v=${Date.now()}`}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>

              <div className="flex flex-col space-y-1 px-1">
                <h3 className="font-heading text-lg font-medium tracking-wide text-foreground">
                  {product.name}
                </h3>

                <p className="font-body text-sm text-muted-foreground">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(product.price || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300"
            onClick={() => {
              setSelectedProduct(null);
              setOrderQuantity(1);
            }}
          >
            <div
              className="bg-background border shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Section */}
              <div className="w-full md:w-1/2 bg-secondary/20 relative aspect-square md:aspect-auto overflow-hidden shrink-0">
                <img
                  src={`${selectedProduct.image}?v=${Date.now()}`}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content Section */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto relative">
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setOrderQuantity(1);
                  }}
                  className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>

                <h2 className="font-heading text-3xl font-medium tracking-wide mb-2 mt-4 text-foreground">
                  {selectedProduct.name}
                </h2>
                <p className="font-body text-xl text-muted-foreground mb-8">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(selectedProduct.price || 0)}
                </p>

                <div className="prose prose-sm text-muted-foreground mb-6 flex-1">
                  <p>A beautifully handcrafted piece featuring intricate details and premium materials. Keep as a statement piece or gift to someone special.</p>
                </div>

                <div className="mt-auto space-y-4">
                  <div>
                    <label htmlFor="quantity" className="block text-xs font-heading font-medium tracking-wide uppercase text-muted-foreground mb-1">Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                      className="w-full border-b border-muted-foreground/30 bg-transparent py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        if (orderQuantity < 1) return;
                        setCart((prev) => {
                          const existingIndex = prev.findIndex(item => item.product.id === selectedProduct.id);
                          if (existingIndex >= 0) {
                            const newCart = [...prev];
                            newCart[existingIndex].quantity += orderQuantity;
                            return newCart;
                          }
                          return [...prev, { product: selectedProduct, quantity: orderQuantity }];
                        });
                        toast.success(`${orderQuantity}x ${selectedProduct.name} added to cart!`);
                        setSelectedProduct(null);
                        setOrderQuantity(1);
                      }}
                      className="w-full bg-foreground text-background font-body uppercase tracking-[0.2em] text-xs py-4 hover:bg-foreground/90 transition-colors active:scale-[0.98]"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-foreground text-background w-14 h-14 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full leading-none shadow-sm">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
          </button>
        )}

        {/* Cart Drawer */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCartOpen(false)}>
            <div 
              className="bg-background w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 relative border-l"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="font-heading text-2xl uppercase tracking-widest text-foreground">Your Bag</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-secondary/20 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-20 h-24 bg-secondary/20 shrink-0 overflow-hidden rounded-sm">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between py-1 flex-1">
                      <div>
                        <h3 className="font-heading text-lg text-foreground">{item.product.name}</h3>
                        <p className="font-body text-sm text-muted-foreground">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.product.price)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-body text-sm text-muted-foreground">Qty: {item.quantity}</span>
                        <button onClick={() => setCart(cart.filter((_, i) => i !== index))} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}

                {cart.length > 0 && (
                  <div className="pt-6 border-t border-border mt-auto">
                    <div className="flex justify-between items-end mb-8 text-foreground">
                      <span className="font-heading uppercase tracking-widest text-sm">Subtotal</span>
                      <span className="font-body text-2xl font-bold">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                          cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
                        )}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="cart-name" className="block text-xs font-heading font-medium tracking-wide uppercase text-muted-foreground mb-1">Full Name</label>
                        <input
                          id="cart-name"
                          type="text"
                          value={orderName}
                          onChange={(e) => setOrderName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full border-b border-muted-foreground/30 bg-transparent py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="cart-email" className="block text-xs font-heading font-medium tracking-wide uppercase text-muted-foreground mb-1">Email Address</label>
                        <input
                          id="cart-email"
                          type="email"
                          value={orderEmail}
                          onChange={(e) => setOrderEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="w-full border-b border-muted-foreground/30 bg-transparent py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="cart-whatsapp" className="block text-xs font-heading font-medium tracking-wide uppercase text-muted-foreground mb-1">WhatsApp Number</label>
                        <input
                          id="cart-whatsapp"
                          type="tel"
                          value={orderWhatsapp}
                          onChange={(e) => setOrderWhatsapp(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full border-b border-muted-foreground/30 bg-transparent py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          disabled={isSubmitting || !orderName.trim() || !orderEmail.trim() || !orderWhatsapp.trim()}
                          onClick={async () => {
                            if (!orderName.trim() || !orderEmail.trim() || !orderWhatsapp.trim()) {
                              toast.error("Please fill out all fields.");
                              return;
                            }
                            
                            setIsSubmitting(true);
                            try {
                              const cartTotal = cart.reduce((t, i) => t + (i.product.price * i.quantity), 0);
                              const productList = cart.map(i => `${i.quantity}x ${i.product.name}`).join(", ");
                              const emailMessage = `You received an order for:\n${cart.map(i => `- ${i.quantity}x ${i.product.name} ($${i.product.price * i.quantity})`).join("\n")}\n\nTotal: $${cartTotal}\n\nName: ${orderName.trim()}\nEmail: ${orderEmail.trim()}\nWhatsApp: ${orderWhatsapp.trim()}`;

                              // 1. Send via EmailJS
                              await emailjs.send(
                                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                                {
                                  product: productList,
                                  name: orderName.trim(),
                                  from_name: orderName.trim(),
                                  customer_name: orderName.trim(),
                                  email: orderEmail.trim(),
                                  reply_to: orderEmail.trim(),
                                  whatsapp: orderWhatsapp.trim(),
                                  quantity: cart.reduce((t, i) => t + i.quantity, 0),
                                  price: cartTotal,
                                  message: emailMessage
                                },
                                { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }
                              );

                              // 2. Save directly to Supabase
                              const orderPromises = cart.map(item => 
                                supabase.from("orders").insert([{
                                  product: item.product.name,
                                  name: orderName.trim(),
                                  email: orderEmail.trim(),
                                  whatsapp: orderWhatsapp.trim(),
                                  quantity: item.quantity,
                                }])
                              );
                              
                              const results = await Promise.all(orderPromises);
                              const hasError = results.some(res => res.error);
                              if (hasError) throw new Error("Some items failed to save to Supabase.");

                              // 3. Success Feedback
                              toast.success("Order sent successfully! We'll be in touch.");
                              setCart([]);
                              setIsCartOpen(false);
                              setOrderName("");
                              setOrderEmail("");
                              setOrderWhatsapp("");
                            } catch (error: any) {
                              console.error("ORDER SUBMIT ERROR:", error);
                              toast.error(`Failed to place order: ${error?.message || error?.text || "Unknown error occurred"}`);
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                          className="w-full bg-foreground text-background font-body uppercase tracking-[0.2em] text-xs py-4 hover:bg-foreground/90 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {isSubmitting ? "Processing..." : "Place Pre-Order"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {cart.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    <p className="font-body uppercase tracking-widest text-sm">Your bag is empty</p>
                    <button onClick={() => setIsCartOpen(false)} className="mt-4 px-6 py-2 border border-border hover:bg-foreground hover:text-background transition-colors font-body uppercase tracking-widest text-xs">Continue Shopping</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;