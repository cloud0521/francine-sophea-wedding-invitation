import { useEffect, useState } from "react";
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
  const [opened, setOpened] = useState(false);
  const [response, setResponse] = useState("");
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (opened) return undefined;

    const scrollY = window.scrollY;
    const body = document.body;
    const previousStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      Object.assign(body.style, previousStyles);
      window.scrollTo(0, scrollY);
    };
  }, [opened]);

  const handleRsvpSubmit = (event) => {
    event.preventDefault();
    if (!guestName.trim() || !response) return;

    setMessage(
      `Thank you, ${guestName.trim()}. Your response is ready to send once RSVP is connected.`,
    );
  };

  return (
    <>
      {!opened && <OpeningScreen onOpen={() => setOpened(true)} />}
      <SiteHeader />

      <main className="invitation-flow">
        <AnnouncementSection />
        <CountdownSection />
        <LoveStorySection />
        <GallerySection />
        <DetailsSection />
        <EntourageSection />
        <AttireSection />
        <NotesSection />
        <RsvpSection
          guestName={guestName}
          response={response}
          message={message}
          onGuestNameChange={setGuestName}
          onResponseChange={setResponse}
          onSubmit={handleRsvpSubmit}
        />
        <ThankYouSection />
      </main>

      <footer style={{ "--footer-monogram": `url(${image("sandf")})` }}>
        <a className="wordmark footer-mark" href="#home">
          <span className="wordmark-names">
            SOPHEA <i>&</i> FRANCINE DALE
          </span>
        </a>
        <p>
          Crafted with love by <b>Dreamz Invites</b>, creating timeless digital
          wedding experiences.
        </p>
        <a href="#home" className="back-top">
          BACK TO TOP ↑
        </a>
      </footer>
    </>
  );
}

export default App;
