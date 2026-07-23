const beads = [
  { size: 8, left: "10%", delay: "0s", duration: "4s" },
  { size: 6, left: "25%", delay: "1s", duration: "5s" },
  { size: 10, left: "45%", delay: "0.5s", duration: "4.5s" },
  { size: 5, left: "65%", delay: "2s", duration: "3.5s" },
  { size: 7, left: "80%", delay: "1.5s", duration: "5.5s" },
  { size: 4, left: "90%", delay: "0.8s", duration: "4.2s" },
];

const FloatingBeads = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {beads.map((b, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-primary/20 animate-float-bead"
        style={{
          width: b.size,
          height: b.size,
          left: b.left,
          top: `${20 + i * 12}%`,
          animationDelay: b.delay,
          animationDuration: b.duration,
        }}
      />
    ))}
  </div>
);

export default FloatingBeads;
