import { image } from "../data/weddingContent.js";

function OpeningScreen({ onOpen }) {
  return (
    <div
      className="opening"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation opening"
    >
      <img
        className="opening-logo"
        src={image("sandf")}
        alt=""
        aria-hidden="true"
      />
      <div className="opening-verse">
        <span className="eyebrow light opening-heading">
          A PROMISE FOR THE JOURNEY
        </span>
        <p className="opening-quote">
          “When the time is right, the Lord will make it happen.”
        </p>
        <small className="opening-citation">ISAIAH 60:22</small>
      </div>
      <button className="open-invitation" onClick={onOpen}>
        Open the invitation
      </button>
      <span className="opening-foot">
        A DAY TO REMEMBER · DECEMBER 29, 2026
      </span>
    </div>
  );
}

export default OpeningScreen;
