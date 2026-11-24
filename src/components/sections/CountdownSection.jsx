import { useEffect, useRef } from "react";
import Countdown from "../Countdown.jsx";
import { observeElementsAtHalfVisibility } from "../../utils/observeElementsAtHalfVisibility.js";

function CountdownSection() {
  const flowerRefs = useRef([]);

  useEffect(() => {
    return observeElementsAtHalfVisibility(
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
        <img
          ref={(element) => {
            flowerRefs.current[0] = element;
          }}
          className="countdown-corner-flower top-right"
          src={`${import.meta.env.BASE_URL}images/cornerflower1.webp`}
          alt=""
        />
        <img
          ref={(element) => {
            flowerRefs.current[1] = element;
          }}
          className="countdown-corner-flower bottom-left"
          src={`${import.meta.env.BASE_URL}images/cornerflower1.webp`}
          alt=""
        />
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
