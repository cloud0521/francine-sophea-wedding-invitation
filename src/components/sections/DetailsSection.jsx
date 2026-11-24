import { useEffect, useRef } from "react";

const cornerFlower = `${import.meta.env.BASE_URL}images/cornerflower22.png`;

function ChurchIllustration() {
  return (
    <svg
      className="wedding-day-illustration"
      viewBox="0 0 180 120"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 101h124M39 101V56l51-31 51 31v45M55 101V67h70v34" />
        <path d="M77 101V77a13 13 0 0 1 26 0v24M90 25V10m-7 7h14M51 57h78M69 56V44h12v12m18 0V44h12v12" />
        <path d="M35 101v-8m110 8v-8M21 101h138" />
      </g>
      <path d="M86 17h8M88 13h4" stroke="var(--wedding-champagne)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="90" cy="72" r="2" fill="var(--wedding-champagne)" />
    </svg>
  );
}

function ChampagneIllustration() {
  return (
    <svg
      className="wedding-day-illustration reception-illustration"
      viewBox="0 0 180 120"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <path d="m56 26 8 37c2 10 10 16 20 16h5c10 0 18-6 20-16l8-37M56 26h61M90 79v23m-15 0h30M90 79l-25-22m25 22 25-22" />
        <path d="m48 33 7 32c2 10 10 16 20 16h3m-30-48h12m65-7-8 37c-2 10-10 16-20 16h-3m31-48h-12" opacity=".45" />
        <path d="M63 49h49M58 49h12m48 0h-12" />
      </g>
      <path d="m87 73 3-4 3 4-3 4-3-4Z" fill="var(--wedding-champagne)" />
    </svg>
  );
}

function MapPin() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path d="M13 6.7c0 3.5-5 7.5-5 7.5S3 10.2 3 6.7a5 5 0 1 1 10 0Z" />
      <circle cx="8" cy="6.5" r="1.6" />
    </svg>
  );
}

function EventDetails({ reception = false }) {
  const location = reception
    ? "St. Roch Parish Church Town Hall"
    : "St. Roch Parish Church";
  const mapQuery = reception
    ? "St.+Roch+Parish+Church+Town+Hall+Brgy+Bato+Sagay+City+Negros+Occidental"
    : "St.+Roch+Parish+Church+Brgy+Bato+Sagay+City+Negros+Occidental";

  return (
    <div className="wedding-day-event-copy">
      <p className="wedding-day-eyebrow">
        {reception ? "THE RECEPTION" : "THE CEREMONY"}
      </p>
      <h3>{reception ? "Let the Celebration Begin" : "A Promise Before God"}</h3>
      <p className="wedding-day-time">
        {reception ? "Following the ceremony" : "Two o’clock in the afternoon"}
      </p>
      <p className="wedding-day-venue">{location}</p>
      <p className="wedding-day-address">
        Brgy. Bato, Sagay City, Negros Occidental
      </p>
      <a
        className="wedding-day-location"
        href={`https://maps.google.com/?q=${mapQuery}`}
        target="_blank"
        rel="noreferrer"
      >
        <MapPin />
        <span>View Location</span>
      </a>
    </div>
  );
}

function DetailsSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const revealGroups = section.querySelectorAll(".wedding-day-reveal");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealGroups.forEach((group) => group.classList.add("is-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-revealed", entry.isIntersecting);
        });
      },
      { threshold: 0 },
    );

    revealGroups.forEach((group) => observer.observe(group));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="details chapter-card wedding-day-card"
      id="details"
      aria-label="Wedding Details"
    >
      <img
        className="wedding-day-vine"
        src={cornerFlower}
        alt=""
        aria-hidden="true"
      />
      <img
        className="wedding-day-vine wedding-day-vine-top-left"
        src={cornerFlower}
        alt=""
        aria-hidden="true"
      />
      <header className="wedding-day-header wedding-day-reveal">
        <span className="wedding-day-ornament" aria-hidden="true">
          <span />
        </span>
        <h2>The Wedding Day</h2>
        <p className="wedding-day-subtitle">Together, we begin our forever.</p>
        <div className="wedding-day-date" aria-label="Tuesday, December 29, 2026">
          <span>TUESDAY</span>
          <strong>29 December 2026</strong>
        </div>
      </header>

      <div className="wedding-day-program">
        <div className="wedding-day-event wedding-day-reveal">
          <ChurchIllustration />
          <EventDetails />
        </div>

        <div className="wedding-day-divider" aria-hidden="true">
          <span />
        </div>

        <div className="wedding-day-event wedding-day-reveal">
          <ChampagneIllustration />
          <EventDetails reception />
        </div>
      </div>

    </section>
  );
}

export default DetailsSection;
