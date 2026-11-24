import { image } from "../../data/weddingContent.js";

function AnnouncementSection() {
  return (
    <section
      className="hero chapter-card announcement-card"
      id="home"
      aria-label="Wedding Announcement"
    >
      <div className="hero-image-wrap">
        <img
          className="hero-image"
          src={image("2")}
          alt="Sophea and Francine laughing together in an open field"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-photo-wash" />
      </div>
      <div className="hero-content-layer">
        <div className="hero-top-content">
          <span className="eyebrow">TOGETHER WITH THEIR FAMILIES</span>
          <h1>
            Francine
            <br />
            <em>and</em>
            <br />
            Sophea
          </h1>
          <p className="hero-intro">
            invite you to celebrate a day filled with love, joy, and the
            beginning of forever.
          </p>
        </div>
        <div className="hero-bottom-content">
          <div className="hero-date">
            <span className="hero-date-month">DECEMBER</span>
            <span className="hero-date-side hero-date-weekday">TUESDAY</span>
            <strong>29</strong>
            <span className="hero-date-side hero-date-time">AT 2 PM</span>
            <span className="hero-date-year">2026</span>
          </div>
          <a href="#countdown" className="text-link">
            Explore the invitation
          </a>
        </div>
      </div>
    </section>
  );
}

export default AnnouncementSection;
