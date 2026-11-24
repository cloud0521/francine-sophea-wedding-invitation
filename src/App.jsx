import { useEffect, useLayoutEffect, useState } from "react";
import AnnouncementSection from "./components/sections/AnnouncementSection.jsx";
import AttireSection from "./components/sections/AttireSection.jsx";
import CountdownSection from "./components/sections/CountdownSection.jsx";
import DetailsSection from "./components/sections/DetailsSection.jsx";
import EntourageSection from "./components/sections/EntourageSection.jsx";
import GallerySection from "./components/sections/GallerySection.jsx";
import LoveStorySection from "./components/sections/LoveStorySection.jsx";
import NotesSection from "./components/sections/NotesSection.jsx";
import RsvpSection from "./components/sections/RsvpSection.jsx";
import ThankYouSection from "./components/sections/ThankYouSection.jsx";
import OpeningScreen from "./components/OpeningScreen.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import { image } from "./data/weddingContent.js";

function App() {
  const [openingState, setOpeningState] = useState("closed");
  const [showOpening, setShowOpening] = useState(true);
  const [isHeroImageReady, setIsHeroImageReady] = useState(false);

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

  const handleOpening = () => {
    if (openingState !== "closed" || !isHeroImageReady) return;
    setOpeningState("opening");
  };

  return (
    <>
      {showOpening && (
        <OpeningScreen
          isHeroImageReady={isHeroImageReady}
          onOpen={handleOpening}
        />
      )}
      <SiteHeader inert={openingState !== "opened"} />

      <main
        className={`invitation-flow${
          openingState === "opening" ? " is-transition-revealing" : ""
        }`}
        inert={openingState !== "opened"}
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
          inert={openingState !== "opened"}
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
    </>
  );
}

export default App;
