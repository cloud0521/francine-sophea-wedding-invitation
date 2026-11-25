import { useEffect, useRef } from "react";
import Countdown from "../Countdown.jsx";
import { observeCornerFlowers } from "../../utils/observeElementsAtHalfVisibility.js";

function CountdownSection() {
  const flowerRefs = useRef([]);

  useEffect(() => {
    return observeCornerFlowers(
      flowerRefs.current.filter(Boolean),
    );
  }, []);

  return (
    <section
      className="countdown-section chapter-card"
      id="countdown"
      aria-label="Countdown to Forever"
    >
      <div className="countdown-flower-field" aria-hidden="true">
        <span
          ref={(element) => {
            flowerRefs.current[0] = element;
          }}
          className="countdown-corner-flower top-right"
        >
          <img
            className="countdown-corner-flower-image"
            src={`${import.meta.env.BASE_URL}images/cornerflower1.webp`}
            alt=""
          />
        </span>
        <span
          ref={(element) => {
            flowerRefs.current[1] = element;
          }}
          className="countdown-corner-flower bottom-left"
        >
          <img
            className="countdown-corner-flower-image"
            src={`${import.meta.env.BASE_URL}images/cornerflower1.webp`}
            alt=""
          />
        </span>
      </div>
      <h2>
        <span className="countdown-title-lead">Counting down to</span>
        <em>“I do.”</em>
      </h2>
      <Countdown />
      <span className="countdown-date">DECEMBER 29, 2026 · 2:00 PM</span>
    </section>
  );
}

export default CountdownSection;
