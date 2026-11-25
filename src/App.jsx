import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import AnnouncementSection from "./components/sections/AnnouncementSection.jsx";
import AttireSection from "./components/sections/AttireSection.jsx";
import CountdownSection from "./components/sections/CountdownSection.jsx";
import DetailsSection from "./components/sections/DetailsSection.jsx";
import EntourageSection from "./components/sections/EntourageSection.jsx";
import GallerySection from "./components/sections/GallerySection.jsx";
import LoveStorySection from "./components/sections/LoveStorySection.jsx";
import NotesSection from "./components/sections/NotesSection.jsx";
import RsvpSection, {
  RsvpProvider,
  useRsvpForm,
} from "./components/sections/RsvpSection.jsx";
import ThankYouSection from "./components/sections/ThankYouSection.jsx";
import OpeningScreen from "./components/OpeningScreen.jsx";
import ScriptureIntro from "./components/ScriptureIntro.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import FloatingSectionNavigator from "./components/FloatingSectionNavigator.jsx";
import { image } from "./data/weddingContent.js";

function RsvpPopup({ onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const isClosingRef = useRef(false);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }

    isClosingRef.current = true;
    setIsClosing(true);
  }, [onClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const finishCloseAnimation = (event) => {
    if (
      event.target === dialogRef.current &&
      isClosingRef.current
    ) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={`rsvp-popup-backdrop${isClosing ? " is-closing" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`rsvp-popup-dialog${isClosing ? " is-closing" : ""}`}
        onAnimationEnd={finishCloseAnimation}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rsvp-popup-heading"
        tabIndex={-1}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="rsvp-popup-close"
          onClick={handleClose}
          disabled={isClosing}
        >
          Close <span aria-hidden="true">×</span>
        </button>
        <div className="rsvp-popup-scroll">
          <RsvpSection modal />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function InvitationExperience() {
  const { feedback, guestCount, guestNames, response, guestMessage } =
    useRsvpForm();
  const [openingState, setOpeningState] = useState("closed");
  const [showOpening, setShowOpening] = useState(true);
  const [showScriptureIntro, setShowScriptureIntro] = useState(true);
  const [hasLandingStarted, setHasLandingStarted] = useState(false);
  const [isHeroImageReady, setIsHeroImageReady] = useState(false);
  const [isRsvpPopupOpen, setIsRsvpPopupOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasDismissedRsvpPopup, setHasDismissedRsvpPopup] = useState(false);
  const hasAutoPromptedRsvp = useRef(false);
  const backgroundMusicRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const heroImage = new window.Image();

    const markReady = () => {
      if (!cancelled) setIsHeroImageReady(true);
    };

    heroImage.onload = async () => {
      if (typeof heroImage.decode === "function") {
        try {
          await heroImage.decode();
        } catch {
          // The loaded image can still be used when decode() is unavailable.
        }
      }
      markReady();
    };
    heroImage.onerror = markReady;
    heroImage.src = image("2");

    if (heroImage.complete && heroImage.naturalWidth > 0) {
      markReady();
    }

    return () => {
      cancelled = true;
      heroImage.onload = null;
      heroImage.onerror = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (openingState === "opened") return undefined;

    const html = document.documentElement;
    const body = document.body;
    html.scrollTop = 0;
    body.scrollTop = 0;
    const previousHtmlStyles = {
      overflow: html.style.overflow,
      overscrollBehavior: html.style.overscrollBehavior,
    };
    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = "0";
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      Object.assign(html.style, previousHtmlStyles);
      Object.assign(body.style, previousBodyStyles);
      html.scrollTop = 0;
      body.scrollTop = 0;
    };
  }, [openingState]);

  useEffect(() => {
    if (openingState !== "opening") return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const overlayDuration = reducedMotion ? 250 : 1300;
    const fullDuration = reducedMotion ? 300 : 1800;
    const removeOverlayTimer = window.setTimeout(
      () => setShowOpening(false),
      overlayDuration,
    );
    const finishTimer = window.setTimeout(
      () => setOpeningState("opened"),
      fullDuration,
    );

    return () => {
      window.clearTimeout(removeOverlayTimer);
      window.clearTimeout(finishTimer);
    };
  }, [openingState]);

  useEffect(() => {
    if (openingState !== "opened" || hasDismissedRsvpPopup) {
      return undefined;
    }

    const hasStartedRsvp =
      guestCount > 1 ||
      guestNames.some((name) => name.trim()) ||
      Boolean(response) ||
      Boolean(guestMessage.trim());

    if (feedback?.type === "success" || hasStartedRsvp) {
      hasAutoPromptedRsvp.current = true;
      return undefined;
    }
    if (hasAutoPromptedRsvp.current) return undefined;

    const popupTimer = window.setTimeout(
      () => {
        hasAutoPromptedRsvp.current = true;
        setIsRsvpPopupOpen(true);
      },
      3200,
    );
    return () => window.clearTimeout(popupTimer);
  }, [
    openingState,
    feedback?.type,
    guestCount,
    guestNames,
    response,
    guestMessage,
    hasDismissedRsvpPopup,
  ]);

  useEffect(() => {
    if (!isRsvpPopupOpen) return undefined;

    document.documentElement.classList.add("rsvp-popup-open");
    document.body.classList.add("rsvp-popup-open");
    return () => {
      document.documentElement.classList.remove("rsvp-popup-open");
      document.body.classList.remove("rsvp-popup-open");
    };
  }, [isRsvpPopupOpen]);

  useEffect(() => {
    const audio = backgroundMusicRef.current;
    if (!audio) return undefined;

    const syncPlayingState = () => setIsMusicPlaying(!audio.paused);
    const handleAudioError = () => setIsMusicPlaying(false);
    audio.addEventListener("play", syncPlayingState);
    audio.addEventListener("pause", syncPlayingState);
    audio.addEventListener("ended", syncPlayingState);
    audio.addEventListener("error", handleAudioError);

    return () => {
      audio.removeEventListener("play", syncPlayingState);
      audio.removeEventListener("pause", syncPlayingState);
      audio.removeEventListener("ended", syncPlayingState);
      audio.removeEventListener("error", handleAudioError);
    };
  }, []);

  const handleOpening = () => {
    if (openingState !== "closed" || !isHeroImageReady) return;

    const playback = backgroundMusicRef.current?.play();
    playback?.catch(() => setIsMusicPlaying(false));
    setOpeningState("opening");
  };

  const toggleBackgroundMusic = () => {
    const audio = backgroundMusicRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => setIsMusicPlaying(false));
    } else {
      audio.pause();
    }
  };

  const closeRsvpPopup = useCallback(() => {
    setIsRsvpPopupOpen(false);
    setHasDismissedRsvpPopup(true);
  }, []);

  const beginLandingReveal = useCallback(() => {
    setHasLandingStarted(true);
  }, []);

  const finishScriptureIntro = useCallback(() => {
    setShowScriptureIntro(false);
  }, []);

  return (
    <>
      <audio
        ref={backgroundMusicRef}
        className="invitation-background-music"
        src={`${import.meta.env.BASE_URL}music/happiness.mp3`}
        preload="none"
        loop
      />
      {showScriptureIntro && (
        <ScriptureIntro
          audioRef={backgroundMusicRef}
          onTransitionStart={beginLandingReveal}
          onComplete={finishScriptureIntro}
        />
      )}
      {hasLandingStarted && showOpening && (
        <OpeningScreen
          isHeroImageReady={isHeroImageReady}
          onOpen={handleOpening}
          inert={showScriptureIntro}
        />
      )}
      <SiteHeader
        inert={openingState !== "opened" || isRsvpPopupOpen}
      />

      <main
        className={`invitation-flow${
          openingState === "opening" ? " is-transition-revealing" : ""
        }`}
        inert={openingState !== "opened" || isRsvpPopupOpen}
      >
        <AnnouncementSection />
        <CountdownSection />
        <LoveStorySection />
        <GallerySection />
        <DetailsSection />
        <EntourageSection />
        <AttireSection />
        <NotesSection />
        <RsvpSection />
        <ThankYouSection />
        <footer
          className="brand-footer-card chapter-card"
          inert={openingState !== "opened" || isRsvpPopupOpen}
        >
          <img
            className="brand-footer-logo"
            src={image("logo")}
            alt="Sophea and Francine wedding monogram"
          />
          <span className="wordmark-names brand-footer-names">
            SOPHEA <i>&amp;</i> FRANCINE DALE
          </span>
          <p>
            Crafted with love by{" "}
            <a
              className="footer-credit-link"
              href="https://www.dreamzinvites.asia/"
              target="_blank"
              rel="noreferrer"
            >
              Dreamz Invites
            </a>
            , creating timeless digital wedding experiences.
          </p>
          <a href="#home" className="back-top">
            BACK TO TOP ↑
          </a>
        </footer>
      </main>
      {openingState === "opened" && !isRsvpPopupOpen && (
        <FloatingSectionNavigator
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={toggleBackgroundMusic}
        />
      )}
      {isRsvpPopupOpen && <RsvpPopup onClose={closeRsvpPopup} />}
    </>
  );
}

function App() {
  return (
    <RsvpProvider>
      <InvitationExperience />
    </RsvpProvider>
  );
}

export default App;
