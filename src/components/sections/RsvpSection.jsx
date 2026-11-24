import { useEffect, useRef } from "react";

function EnvelopeIllustration() {
  return (
    <svg
      className="rsvp-envelope"
      viewBox="0 0 160 118"
      fill="none"
      aria-hidden="true"
    >
      <path d="M35 27h90v67H35z" fill="#fffdf8" stroke="currentColor" />
      <path d="M43 19h90v67H43z" fill="#f9f7f0" stroke="currentColor" />
      <path d="M24 38h112v63H24z" fill="#f9f7f0" stroke="currentColor" />
      <path d="m25 40 55 39 55-39M25 100l39-31m71 31L96 69" stroke="currentColor" />
      <path d="m80 70 11 8-11 8-11-8 11-8Z" fill="#b49a6d" stroke="#b49a6d" />
      <path d="M77 79c-5-4-1-8 3-4 4-4 8 0 3 4l-3 3-3-3Z" fill="#f9f7f0" />
      <path d="M42 30h77" stroke="#b49a6d" strokeWidth="1.2" />
    </svg>
  );
}

function RsvpFlourish({ heart = false }) {
  return (
    <svg className="rsvp-flourish" viewBox="0 0 120 20" aria-hidden="true">
      <path d="M1 10h41m36 0h41" />
      {heart ? (
        <path d="M60 16s-7-4.5-7-9a3.7 3.7 0 0 1 7-1.5A3.7 3.7 0 0 1 67 7c0 4.5-7 9-7 9Z" />
      ) : (
        <>
          <path d="m60 4 6 6-6 6-6-6 6-6Z" />
          <path d="M43 10c5-4 11-4 17 0m17 0c-5-4-11-4-17 0" />
        </>
      )}
    </svg>
  );
}

function AttendanceIcon({ type }) {
  if (type === "accept") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m5 12.5 4.5 4.5L19 7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-8-5.1-8-11a4.4 4.4 0 0 1 8-2.4A4.4 4.4 0 0 1 20 9c0 5.9-8 11-8 11Z" />
    </svg>
  );
}

function RsvpSection({
  guestName,
  response,
  message,
  onGuestNameChange,
  onResponseChange,
  onSubmit,
}) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const revealGroups = section.querySelectorAll(".rsvp-reveal");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealGroups.forEach((group) => group.classList.add("is-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 },
    );

    revealGroups.forEach((group) => observer.observe(group));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="rsvp-section chapter-card rsvp-redesign"
      id="rsvp"
      aria-label="RSVP"
    >
      <div className="rsvp-content">
        <div className="rsvp-intro rsvp-reveal">
          <EnvelopeIllustration />
          <h2>RSVP</h2>
          <p className="rsvp-subtitle">Be part of our forever.</p>
          <p className="rsvp-description">
            It would mean so much to have you with us as we begin this beautiful
            new chapter of our lives.
          </p>
          <RsvpFlourish />
        </div>

        <form onSubmit={onSubmit} className="rsvp-form">
          <div className="rsvp-name-field rsvp-reveal">
            <label htmlFor="guest-name">Your full name</label>
            <input
              id="guest-name"
              name="guestName"
              autoComplete="name"
              value={guestName}
              onChange={(event) => onGuestNameChange(event.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <fieldset className="rsvp-attendance rsvp-reveal">
            <legend>Will you be joining us?</legend>
            <label className={`rsvp-option${response === "accept" ? " is-selected" : ""}`}>
              <input
                type="radio"
                name="attendance"
                value="accept"
                checked={response === "accept"}
                onChange={(event) => onResponseChange(event.target.value)}
                required
              />
              <AttendanceIcon type="accept" />
              <span>Joyfully accepts</span>
              <span className="rsvp-radio-mark" aria-hidden="true" />
            </label>
            <label className={`rsvp-option${response === "decline" ? " is-selected" : ""}`}>
              <input
                type="radio"
                name="attendance"
                value="decline"
                checked={response === "decline"}
                onChange={(event) => onResponseChange(event.target.value)}
              />
              <AttendanceIcon type="decline" />
              <span>Regretfully declines</span>
              <span className="rsvp-radio-mark" aria-hidden="true" />
            </label>
          </fieldset>

          <div className="rsvp-submit-group rsvp-reveal">
            <button type="submit" className="submit-rsvp">
              Send my RSVP
            </button>
            {message && (
              <p className="rsvp-message" role="status">
                {message} No reply has been sent yet.
              </p>
            )}
            <p className="rsvp-reminder">
              Kindly honor the invitation as addressed. We appreciate your
              understanding.
            </p>
          </div>
        </form>

        <footer className="rsvp-signature rsvp-reveal">
          <RsvpFlourish heart />
          <p>We cannot wait to celebrate with you.</p>
          <strong>Sophea &amp; Francine</strong>
        </footer>
      </div>
    </section>
  );
}

export default RsvpSection;
