import { useState } from "react";
import { Menu, X } from "lucide-react";
import { image } from "../data/weddingContent.js";

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <a className="wordmark" href="#home" onClick={closeMenu}>
        <img className="brand-monogram" src={image("sandf")} alt="" />
        <span className="wordmark-names">
          SOPHEA <i>&</i> FRANCINE DALE
        </span>
      </a>
      <button
        className="menu-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((isOpen) => !isOpen)}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
      <nav
        className={menuOpen ? "nav-links nav-open" : "nav-links"}
        aria-label="Main navigation"
        onClick={closeMenu}
      >
        <a href="#countdown">Countdown</a>
        <a href="#story">Our story</a>
        <a href="#gallery">Gallery</a>
        <a href="#details">The day</a>
        <a href="#entourage">Entourage</a>
        <a href="#rsvp" className="nav-rsvp">
          RSVP
        </a>
      </nav>
    </header>
  );
}

export default SiteHeader;
