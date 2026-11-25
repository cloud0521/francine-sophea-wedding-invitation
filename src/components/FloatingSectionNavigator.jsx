import { useEffect, useState } from "react";

const sections = [
  { id: "home", title: "Wedding Announcement" },
  { id: "countdown", title: "Countdown to Forever" },
  { id: "story", title: "Our Love Story" },
  { id: "gallery", title: "Captured Moments" },
  { id: "details", title: "Wedding Details" },
  { id: "entourage", title: "Wedding Entourage" },
  { id: "attire", title: "Dress Code" },
  { id: "notes", title: "Wedding Notes" },
  { id: "rsvp", title: "RSVP" },
  { id: "thank-you", title: "Thank You" },
];

function getCurrentSectionIndex() {
  const anchor = window.innerHeight * 0.4;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  sections.forEach(({ id }, index) => {
    const section = document.getElementById(id);
    if (!section) return;

    const bounds = section.getBoundingClientRect();
    if (bounds.top <= anchor && bounds.bottom >= anchor) {
      closestIndex = index;
      closestDistance = 0;
      return;
    }

    const distance = Math.min(
      Math.abs(bounds.top - anchor),
      Math.abs(bounds.bottom - anchor),
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  const atPageBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;
  return atPageBottom ? sections.length - 1 : closestIndex;
}

function FloatingSectionNavigator({ isMusicPlaying, onToggleMusic }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSuppressed, setIsSuppressed] = useState(false);

  useEffect(() => {
    let animationFrame = 0;

    const updateActiveSection = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const nextIndex = getCurrentSectionIndex();
        setActiveIndex((currentIndex) =>
          currentIndex === nextIndex ? currentIndex : nextIndex,
        );
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  useEffect(() => {
    const updateSuppression = () => {
      const focusedFormField = document.activeElement?.matches(
        "input, select, textarea, [contenteditable='true']",
      );
      const hideForKeyboard =
        window.matchMedia("(max-width: 767px)").matches && focusedFormField;
      setIsSuppressed(
        Boolean(hideForKeyboard || document.querySelector(".gallery-lightbox")),
      );
    };

    const observer = new MutationObserver(updateSuppression);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("focusin", updateSuppression);
    document.addEventListener("focusout", updateSuppression);
    updateSuppression();

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", updateSuppression);
      document.removeEventListener("focusout", updateSuppression);
    };
  }, []);

  const goToSection = (id) => {
    const target = document.getElementById(id);
    if (!target) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div
      className={`floating-invitation-controls${isSuppressed ? " is-suppressed" : ""}`}
      aria-hidden={isSuppressed}
    >
      <nav
        className="floating-section-navigator"
        aria-label="Wedding invitation sections"
      >
        <div className="section-navigator-status" aria-live="polite">
          <span className="section-navigator-count">
            {String(activeIndex + 1).padStart(2, "0")} / 10
          </span>
          <span className="section-navigator-title">
            {sections[activeIndex].title}
          </span>
        </div>
        <div className="section-navigator-segments">
          {sections.map((section, index) => (
            <button
              key={section.id}
              className={`section-navigator-segment${
                index === activeIndex ? " is-active" : ""
              }`}
              type="button"
              aria-label={`Go to ${section.title}`}
              aria-current={index === activeIndex ? "step" : undefined}
              onClick={() => goToSection(section.id)}
            >
              <span className="section-navigator-track" aria-hidden="true" />
            </button>
          ))}
        </div>
      </nav>
      <button
        className={`floating-music-control${isMusicPlaying ? " is-playing" : ""}`}
        type="button"
        aria-label={isMusicPlaying ? "Pause background music" : "Play background music"}
        aria-pressed={isMusicPlaying}
        onClick={onToggleMusic}
      >
        {isMusicPlaying ? (
          <span className="music-sound-wave" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((bar) => (
              <span className={`music-sound-bar bar-${bar + 1}`} key={bar} />
            ))}
          </span>
        ) : (
          <span className="music-play-icon" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export default FloatingSectionNavigator;
