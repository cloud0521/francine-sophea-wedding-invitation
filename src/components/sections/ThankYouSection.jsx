import { image } from "../../data/weddingContent.js";

function ThankYouSection() {
  return (
    <section className="closing chapter-card" aria-label="Thank You">
      <img src={image("5")} alt="Sophea and Francine walking together" />
      <div className="closing-overlay" />
      <div className="closing-copy">
        <span className="eyebrow light">UNTIL FOREVER BEGINS</span>
        <h2>
          We can’t wait
          <br />
          to celebrate <em>with you.</em>
        </h2>
        <span className="closing-names">
          SOPHEA <i>&</i> FRANCINE DALE
        </span>
        <span className="closing-date">DECEMBER 29, 2026</span>
      </div>
    </section>
  );
}

export default ThankYouSection;
