import { image } from "../../data/weddingContent.js";
import PetalField from "../PetalField.jsx";

function LoveStorySection() {
  return (
    <section
      className="story-chapter chapter-card"
      id="story"
      aria-label="Our Love Story"
    >
      <PetalField />
      <div className="story-editorial">
        <h2 className="story-title">Our Love Story</h2>
        <p className="story-subtitle">
          Every love story is special. Ours is our favorite.
        </p>
        <figure className="story-photo">
          <img
            src={image("3")}
            alt="Sophea and Francine sharing a close, happy moment"
          />
        </figure>
        <p className="story-paragraph">
          Somehow, it was always you. Through every ordinary day and every
          unexpected turn, we found our way to one another—and discovered that
          the right place can be the right person.
        </p>
        <span className="signature">Sophea &amp; Francine</span>
      </div>
    </section>
  );
}

export default LoveStorySection;
