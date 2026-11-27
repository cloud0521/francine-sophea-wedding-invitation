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
      <svg className="opening-filter-defs" aria-hidden="true" focusable="false">
        <filter
          id="opening-gold-detail-filter"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    2 -1 -1 0 0"
          />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.7" intercept="-0.12" />
          </feComponentTransfer>
        </filter>
      </svg>
      <span
        className="opening-flower-wrap opening-flower-top-left"
        style={{ "--flower-mask": `url("${landingImage("c1.webp")}")` }}
        aria-hidden="true"
      >
        <span className="opening-flower-ambient opening-flower-ambient-top-left" />
        <img
          className="opening-flower opening-flower-image"
          src={landingImage("c1.webp")}
          alt=""
        />
        <img
          className="opening-flower-sweep opening-flower-sweep-top-left"
          src={landingImage("c1.webp")}
          alt=""
        />
        <span
          className="opening-flower-highlight highlight-top-left-one"
          style={{ "--shine-x": "78%", "--shine-y": "9%" }}
        />
        <span
          className="opening-flower-highlight highlight-top-left-two"
          style={{ "--shine-x": "23%", "--shine-y": "29%" }}
        />
        <span
          className="opening-flower-highlight highlight-top-left-three"
          style={{ "--shine-x": "11%", "--shine-y": "88%" }}
        />
      </span>
      <span
        className="opening-flower-wrap opening-flower-bottom-right"
        style={{ "--flower-mask": `url("${landingImage("c2.webp")}")` }}
        aria-hidden="true"
      >
        <span className="opening-flower-ambient opening-flower-ambient-bottom-right" />
        <img
          className="opening-flower opening-flower-image"
          src={landingImage("c2.webp")}
          alt=""
        />
        <img
          className="opening-flower-sweep opening-flower-sweep-bottom-right"
          src={landingImage("c2.webp")}
          alt=""
        />
        <span
          className="opening-flower-highlight highlight-bottom-right-one"
          style={{ "--shine-x": "89%", "--shine-y": "9%" }}
        />
        <span
          className="opening-flower-highlight highlight-bottom-right-two"
          style={{ "--shine-x": "69%", "--shine-y": "36%" }}
        />
        <span
          className="opening-flower-highlight highlight-bottom-right-three"
          style={{ "--shine-x": "29%", "--shine-y": "77%" }}
        />
      </span>

      <div
        className="opening-content"
        role="group"
        aria-label="Invitation cover"
      >
        <span className="opening-logo-motion" aria-hidden="true">
          <img className="opening-logo" src={image("logo")} alt="" />
        </span>

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
