import { useEffect, useRef } from "react";
import { image } from "../../data/weddingContent.js";
import { observeCornerFlowers } from "../../utils/observeElementsAtHalfVisibility.js";

const cornerFlower = `${import.meta.env.BASE_URL}images/cornerflower22.png`;

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
      section
        .querySelectorAll(".wedding-day-vine-wrap")
        .forEach((flower) => flower.classList.add("is-visible"));
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
    const stopObservingFlowers = observeCornerFlowers(
      section.querySelectorAll(".wedding-day-vine-wrap"),
    );

    return () => {
      observer.disconnect();
      stopObservingFlowers();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="details chapter-card wedding-day-card"
      id="details"
      aria-label="Wedding Details"
    >
      <span className="wedding-day-vine-wrap" aria-hidden="true">
        <img className="wedding-day-vine" src={cornerFlower} alt="" />
      </span>
      <span
        className="wedding-day-vine-wrap wedding-day-vine-top-left"
        aria-hidden="true"
      >
        <img className="wedding-day-vine" src={cornerFlower} alt="" />
      </span>
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
          <img
            className="wedding-day-illustration"
            src={image("wedding-chapel-sketch")}
            alt=""
            aria-hidden="true"
          />
          <EventDetails />
        </div>

        <div className="wedding-day-event wedding-day-reveal">
          <img
            className="wedding-day-illustration reception-illustration"
            src={image("wedding-reception-glass")}
            alt=""
            aria-hidden="true"
          />
          <EventDetails reception />
        </div>
      </div>

    </section>
  );
}

export default DetailsSection;
