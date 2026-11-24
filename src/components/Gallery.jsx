import { useEffect, useRef, useState } from "react";
import { galleryPhotos } from "../data/weddingContent.js";

const scrollRoller = `${import.meta.env.BASE_URL}images/scrollBat.webp`;

function ScrollCloseControl({ position, onClose, disabled }) {
  return (
    <button
      className={`royal-scroll-close scroll-close-${position}`}
      type="button"
      aria-label="Roll up scroll"
      disabled={disabled}
      onClick={onClose}
    >
      <svg viewBox="0 0 16 8" aria-hidden="true" focusable="false">
        <path d="m2 1 6 5 6-5" />
      </svg>
      <span>Roll up scroll</span>
    </button>
  );
}

function Gallery() {
  const [isUnfastening, setIsUnfastening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const isOpeningRef = useRef(false);
  const pullStartRef = useRef(null);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const photoTriggerRef = useRef(null);
  const cordRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!isOpen || isClosing) return undefined;

    const photos = scrollRef.current?.querySelectorAll(".royal-scroll-photo");
    if (!photos?.length) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      photos.forEach((photo) => photo.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            entry.target.classList.add("has-entered", "is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.5 },
    );

    photos.forEach((photo) => observer.observe(photo));

    return () => {
      observer.disconnect();
    };
  }, [isOpen, isClosing]);

  useEffect(
    () => () => {
      window.clearTimeout(openTimerRef.current);
      window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!selectedPhoto) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
        window.requestAnimationFrame(() => photoTriggerRef.current?.focus());
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto]);

  const releaseScroll = (pull = 36) => {
    if (isOpeningRef.current) return;

    isOpeningRef.current = true;
    cordRef.current?.style.setProperty(
      "--pull-distance",
      `${Math.max(36, Math.min(pull, 100))}px`,
    );
    setIsUnfastening(true);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    openTimerRef.current = window.setTimeout(
      () => setIsOpen(true),
      prefersReducedMotion ? 0 : 520,
    );
  };

  const handlePointerDown = (event) => {
    if (isOpeningRef.current) return;

    pullStartRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (pullStartRef.current === null || isOpeningRef.current) return;

    const pull = Math.max(0, event.clientY - pullStartRef.current);
    cordRef.current?.style.setProperty(
      "--pull-distance",
      `${Math.min(pull, 100)}px`,
    );

    if (pull >= 48) {
      pullStartRef.current = null;
      releaseScroll(pull);
    }
  };

  const handlePointerUp = () => {
    pullStartRef.current = null;
    if (!isOpeningRef.current) {
      cordRef.current?.style.setProperty("--pull-distance", "0px");
    }
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    window.requestAnimationFrame(() => photoTriggerRef.current?.focus());
  };

  const closeScroll = (event) => {
    if (!isOpen || isClosing) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isBottomControl = event.currentTarget.classList.contains(
      "scroll-close-bottom",
    );

    if (isBottomControl) {
      scrollRef.current
        ?.closest(".gallery-section")
        ?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
    }

    setIsClosing(true);

    closeTimerRef.current = window.setTimeout(
      () => {
        setIsOpen(false);
        setIsClosing(false);
        setIsUnfastening(false);
        isOpeningRef.current = false;
        cordRef.current?.style.setProperty("--pull-distance", "0px");
      },
      prefersReducedMotion ? 0 : 1800,
    );
  };

  const showPhoto = (photo, event) => {
    photoTriggerRef.current = event.currentTarget;
    setSelectedPhoto(photo);
  };

  return (
    <div className="royal-scroll-experience">
      <div
        ref={scrollRef}
        className={`royal-scroll${isOpen ? " is-open" : ""}${
          isClosing ? " is-closing" : ""
        }`}
      >
        <img
          className="scroll-roller scroll-roller-top"
          src={scrollRoller}
          alt=""
          aria-hidden="true"
        />

        <div className="royal-scroll-lower">
          <div className="royal-scroll-paper-clip">
            <div className="royal-scroll-paper">
              {isOpen && (
                <ScrollCloseControl
                  position="top"
                  onClose={closeScroll}
                  disabled={isClosing}
                />
              )}
              <div className="royal-gallery-list">
                {galleryPhotos.map((photo, index) => (
                  <button
                    className="royal-scroll-photo"
                    key={photo.src}
                    type="button"
                    aria-label={`View photo ${index + 1}: ${photo.alt}`}
                    onClick={(event) => showPhoto(photo, event)}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.shape === "portrait" ? 2 : 3}
                      height={photo.shape === "portrait" ? 3 : 2}
                      loading="lazy"
                    />
                    <span className="royal-scroll-photo-caption">
                      {photo.alt}
                    </span>
                  </button>
                ))}
              </div>
              {isOpen && (
                <ScrollCloseControl
                  position="bottom"
                  onClose={closeScroll}
                  disabled={isClosing}
                />
              )}
            </div>
          </div>

          <img
            className="scroll-roller scroll-roller-bottom"
            src={scrollRoller}
            alt=""
            aria-hidden="true"
          />
        </div>

        {!isOpen && (
          <button
            ref={cordRef}
            className={`scroll-cord-control${isUnfastening ? " is-unfastening" : ""}`}
            type="button"
            aria-label="Pull the cord to open the photo scroll"
            aria-describedby="scroll-instruction"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={() => releaseScroll()}
          >
            <svg
              className="scroll-cord-svg"
              viewBox="0 0 80 280"
              role="presentation"
              aria-hidden="true"
            >
              <path
                className="scroll-cord-line"
                d="M40 0 C29 15 30 28 40 42 C50 56 51 68 40 83 C30 97 31 112 40 128 C49 144 50 158 40 174 C39 199 43 222 40 250"
              />
              <path
                className="scroll-cord-knot"
                d="M40 143 C18 132 17 153 40 165 C63 153 62 132 40 143Z"
              />
              <path
                className="scroll-cord-tassel"
                d="M40 246 C31 255 32 266 40 270 C48 266 49 255 40 246Z M36 266 L33 279 M40 268 L40 281 M44 266 L47 279"
              />
            </svg>
          </button>
        )}
      </div>

      <p
        className={`scroll-instruction${isOpen ? " is-hidden" : ""}`}
        id="scroll-instruction"
        aria-hidden={isOpen}
      >
        Gently pull.
      </p>

      {selectedPhoto && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
        >
          <button
            className="gallery-lightbox-close"
            type="button"
            onClick={closeLightbox}
          >
            Close
          </button>
          <img src={selectedPhoto.src} alt={selectedPhoto.alt} />
        </div>
      )}
    </div>
  );
}

export default Gallery;
