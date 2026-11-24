import Countdown from "../Countdown.jsx";

function CountdownSection() {
  return (
    <section
      className="countdown-section chapter-card"
      id="countdown"
      aria-label="Countdown to Forever"
    >
      <h2>
        Counting down to <em>“I do.”</em>
      </h2>
      <Countdown />
      <span className="countdown-date">DECEMBER 29, 2026 · 2:00 PM</span>
    </section>
  );
}

export default CountdownSection;
