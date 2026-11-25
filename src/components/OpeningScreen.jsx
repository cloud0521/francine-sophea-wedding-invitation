import { useRef, useState } from "react";
import { image } from "../data/weddingContent.js";

const landingImage = (filename) =>
  `${import.meta.env.BASE_URL}images/landing/${filename}`;

function OpeningScreen({ isHeroImageReady, onOpen, inert = false }) {
  const [isOpening, setIsOpening] = useState(false);
  const openingStarted = useRef(false);

  const handleOpen = () => {
    if (openingStarted.current || !isHeroImageReady) return;
    openingStarted.current = true;
    setIsOpening(true);
    onOpen();
  };

  return (
    <div
      className={`opening${isOpening ? " is-opening" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation opening"
      inert={inert}
    >
      <div className="opening-backdrop" aria-hidden="true" />
      <img
        className="opening-flower opening-flower-top-left"
        src={landingImage("c1.webp")}
        alt=""
        aria-hidden="true"
      />
      <img
        className="opening-flower opening-flower-bottom-right"
        src={landingImage("c2.webp")}
        alt=""
        aria-hidden="true"
      />

      <div
        className="opening-content"
        role="group"
        aria-label="Invitation cover"
      >
        <img
          className="opening-logo"
          src={image("logo")}
          alt=""
          aria-hidden="true"
        />

        <div className="opening-copy opening-reveal">
          <span className="opening-heading">A PROMISE FOR THE JOURNEY</span>
          <img
            className="opening-divider"
            src={landingImage("devider.webp")}
            alt=""
            aria-hidden="true"
          />
          <p className="opening-quote">
            “When the time is right, I, the Lord, will make it happen.”
          </p>
          <small className="opening-citation">ISAIAH 60:22</small>
          <img
            className="opening-divider"
            src={landingImage("devider.webp")}
            alt=""
            aria-hidden="true"
          />
          <button
            className="open-invitation"
            type="button"
            onClick={handleOpen}
            disabled={isOpening || !isHeroImageReady}
          >
            OPEN THE INVITATION
          </button>
        </div>
      </div>

      <div className="opening-foot-wrap opening-reveal">
        <span className="opening-foot">
          A DAY TO REMEMBER · DECEMBER 29, 2026
        </span>
      </div>
    </div>
  );
}

export default OpeningScreen;
