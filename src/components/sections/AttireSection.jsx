import { useEffect, useRef } from "react";

const imageBase = `${import.meta.env.BASE_URL}images/`;

const guestColors = [
  { name: "Deep blue", color: "#294E65" },
  { name: "Steel blue", color: "#477794" },
  { name: "Dusty blue", color: "#779DB8" },
  { name: "Powder blue", color: "#A9C4D3" },
  { name: "Pale blue", color: "#D5E3E8" },
];

const entourageColors = [
  { name: "Deep dusty blue", color: "#395E78" },
  { name: "Medium dusty blue", color: "#507F9D" },
  { name: "Light dusty blue", color: "#ADC7D5" },
];

function ColorPalette({ colors, label, className = "" }) {
  return (
    <div className={`attire-palette attire-reveal ${className}`} role="group" aria-label={label}>
      {colors.map(({ name, color }) => (
        <span
          className="attire-swatch"
          key={name}
          style={{ "--swatch-color": color }}
          title={name}
          aria-label={name}
        />
      ))}
    </div>
  );
}

function AttireSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const revealItems = section.querySelectorAll(".attire-reveal");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="attire chapter-card attire-guide"
      aria-label="Attire Guide"
      style={{ "--attire-background-image": `url("${imageBase}bg_attire.webp")` }}
    >
      <header className="attire-guide-header attire-reveal">
        <h2>Attire Guide</h2>
        <p>Dressed for a beautiful day.</p>
      </header>

      <section className="attire-guide-section attire-guide-guests">
        <div className="attire-guide-copy attire-reveal">
          <h3>Our Dear Guests</h3>
          <p>
            We kindly encourage our guests to wear formal or semi-formal attire
            inspired by our chosen shades of blue.
          </p>
        </div>

        <ColorPalette
          colors={guestColors}
          label="Guest attire color palette"
          className="attire-palette-guests"
        />

        <img
          className="attire-illustration attire-reveal"
          src={`${imageBase}guestAttire-cutout.png`}
          alt="Four illustrated guest attire examples in blue and neutral tones"
          loading="lazy"
        />
      </section>

      <section className="attire-guide-section attire-guide-entourage">
        <div className="attire-guide-copy attire-reveal">
          <h3>Our Entourage</h3>
          <div className="attire-guidelines">
            <p>
              <strong>Gentlemen</strong>
              <span>Light beige barong with black pants.</span>
            </p>
            <p>
              <strong>Ladies</strong>
              <span>Formal gown in the shades shown below.</span>
            </p>
          </div>
        </div>

        <ColorPalette
          colors={entourageColors}
          label="Entourage attire color palette"
          className="attire-palette-entourage"
        />

        <img
          className="attire-illustration attire-reveal"
          src={`${imageBase}entourageAttire-cutout.png`}
          alt="Four illustrated wedding entourage attire examples in beige and dusty blue"
          loading="lazy"
        />
      </section>

      <p className="attire-guide-closing attire-reveal">
        We look forward to celebrating with you in beautiful shades of blue.
      </p>
    </section>
  );
}

export default AttireSection;
