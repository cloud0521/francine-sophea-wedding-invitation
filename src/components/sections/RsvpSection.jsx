import { createContext, useContext, useEffect, useRef, useState } from "react";

const RsvpContext = createContext(null);

function EnvelopeIllustration() {
  return (
    <img
      className="rsvp-envelope"
      src={`${import.meta.env.BASE_URL}images/rsvp-floral-envelope.webp`}
      alt=""
      aria-hidden="true"
    />
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

function createRequestId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex
    .slice(10, 16)
    .join("")}`;
}

export function RsvpProvider({ children }) {
  const requestIdRef = useRef("");
  const requestFingerprintRef = useRef("");
  const [guestCount, setGuestCount] = useState(1);
  const [guestNames, setGuestNames] = useState([""]);
  const [revealedGuestFields, setRevealedGuestFields] = useState(new Set());
  const [response, setResponse] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleGuestCountChange = (event) => {
    const nextCount = Number(event.target.value);

    if (nextCount > guestCount) {
      setRevealedGuestFields((currentFields) => {
        const nextFields = new Set(currentFields);
        for (let index = guestCount; index < nextCount; index += 1) {
          nextFields.add(index);
        }
        return nextFields;
      });
    }

    setGuestCount(nextCount);
    setFeedback(null);
  };

  const handleResponseChange = (value) => {
    setResponse(value);
    setFeedback(null);
  };

  const handleGuestMessageChange = (value) => {
    setGuestMessage(value);
    setFeedback(null);
  };

  const resetForm = () => {
    requestIdRef.current = "";
    requestFingerprintRef.current = "";
    setGuestCount(1);
    setGuestNames([""]);
    setRevealedGuestFields(new Set());
    setResponse("");
    setGuestMessage("");
    setFeedback(null);
  };

  const handleGuestNameChange = (index, value) => {
    setGuestNames((currentNames) => {
      const nextNames = [...currentNames];
      nextNames[index] = value;
      return nextNames;
    });
    setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || feedback?.type === "success") return;

    const normalizedNames = guestNames
      .slice(0, guestCount)
      .map((name) => name.trim().replace(/\s+/g, " "));

    if (normalizedNames.some((name) => name.length === 0)) {
      setFeedback({
        type: "error",
        text: "Please enter the full name of every invited guest.",
      });
      return;
    }

    if (normalizedNames.some((name) => name.length > 100)) {
      setFeedback({
        type: "error",
        text: "Each guest name must be 100 characters or fewer.",
      });
      return;
    }

    const uniqueNames = new Set(
      normalizedNames.map((name) => name.toLocaleLowerCase()),
    );
    if (uniqueNames.size !== normalizedNames.length) {
      setFeedback({
        type: "error",
        text: "Please remove duplicate names before sending your RSVP.",
      });
      return;
    }

    if (!response) {
      setFeedback({
        type: "error",
        text: "Please choose whether you will be joining us.",
      });
      return;
    }

    const normalizedMessage = guestMessage.trim();
    if (normalizedMessage.length > 500) {
      setFeedback({
        type: "error",
        text: "Your message must be 500 characters or fewer.",
      });
      return;
    }
    setGuestMessage(normalizedMessage);

    setGuestNames((currentNames) =>
      currentNames.map((name, index) =>
        index < guestCount ? normalizedNames[index] : name,
      ),
    );

    const requestFingerprint = JSON.stringify([
      normalizedNames,
      response,
      normalizedMessage,
    ]);
    if (requestFingerprintRef.current !== requestFingerprint) {
      requestIdRef.current = createRequestId();
      requestFingerprintRef.current = requestFingerprint;
    }
    setIsSubmitting(true);
    setFeedback({ type: "loading", text: "Sending your RSVP…" });
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const result = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          requestId: requestIdRef.current,
          guestNames: normalizedNames,
          attendance: response,
          message: normalizedMessage,
          website: "",
        }),
      });

      let payload;
      try {
        payload = await result.json();
      } catch {
        throw new Error("We could not read the RSVP service response.");
      }

      if (!result.ok || !payload.ok) {
        throw new Error(
          payload.message || "Your RSVP could not be saved. Please try again.",
        );
      }

      requestIdRef.current = "";
      requestFingerprintRef.current = "";
      setFeedback({
        type: "success",
        text: `Thank you. Your RSVP for ${normalizedNames.join(
          normalizedNames.length > 2 ? ", " : " and ",
        )} has been received.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error?.name === "AbortError"
            ? "The RSVP service took too long to respond. Please try again."
            : error instanceof Error
            ? error.message
            : "Your RSVP could not be saved. Please try again.",
      });
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <RsvpContext.Provider
      value={{
        guestCount,
        guestNames,
        revealedGuestFields,
        response,
        guestMessage,
        isSubmitting,
        feedback,
        handleGuestCountChange,
        handleGuestNameChange,
        handleResponseChange,
        handleGuestMessageChange,
        handleSubmit,
        resetForm,
      }}
    >
      {children}
    </RsvpContext.Provider>
  );
}

export function useRsvpForm() {
  const context = useContext(RsvpContext);
  if (!context) {
    throw new Error("useRsvpForm must be used inside RsvpProvider.");
  }
  return context;
}

function RsvpSection({ modal = false }) {
  const sectionRef = useRef(null);
  const {
    guestCount,
    guestNames,
    revealedGuestFields,
    response,
    guestMessage,
    isSubmitting,
    feedback,
    handleGuestCountChange,
    handleGuestNameChange,
    handleResponseChange,
    handleGuestMessageChange,
    handleSubmit,
    resetForm,
  } = useRsvpForm();
  const prefix = modal ? "rsvp-popup" : "rsvp";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const revealGroups = section.querySelectorAll(
      ".rsvp-reveal:not(.is-revealed)",
    );
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
  }, [guestCount, feedback?.type]);

  return (
    <section
      ref={sectionRef}
      className={`rsvp-section chapter-card rsvp-redesign${
        modal ? " rsvp-popup-card" : ""
      }`}
      id={modal ? "rsvp-popup-card" : "rsvp"}
      aria-label="RSVP"
    >
      <div className="rsvp-content">
        <div className="rsvp-intro rsvp-reveal">
          <EnvelopeIllustration />
          <h2 id={`${prefix}-heading`}>RSVP</h2>
          <p className="rsvp-subtitle">Be part of our forever.</p>
          <p className="rsvp-description">
            It would mean so much to have you with us as we begin this beautiful
            new chapter of our lives.
          </p>
          <RsvpFlourish />
        </div>

        {feedback?.type === "success" ? (
          <div
            className="rsvp-thank-you rsvp-reveal is-revealed"
            role="status"
            aria-live="polite"
          >
            <RsvpFlourish heart />
            <h3>Thank you</h3>
            <p>{feedback.text}</p>
            <button
              type="button"
              className="submit-rsvp"
              onClick={resetForm}
            >
              Submit another RSVP
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rsvp-form">
          <div className="rsvp-guest-count rsvp-reveal">
            <label htmlFor={`${prefix}-guest-count`}>Number of Guests</label>
            <select
              id={`${prefix}-guest-count`}
              name="guestCount"
              value={guestCount}
              onChange={handleGuestCountChange}
              disabled={isSubmitting || feedback?.type === "success"}
            >
              {[1, 2, 3, 4, 5].map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
            <p className="rsvp-guest-reminder">
              Please include only the guests named in your invitation.
            </p>
          </div>

          <div className="rsvp-guest-fields">
            {Array.from({ length: guestCount }, (_, index) => (
              <div
                className={`rsvp-name-field rsvp-reveal${
                  revealedGuestFields.has(index)
                    ? " is-revealed is-entering"
                    : ""
                }`}
                key={index}
              >
                <label htmlFor={`${prefix}-guest-name-${index + 1}`}>
                  {guestCount === 1
                    ? "Your full name"
                    : `Guest ${index + 1} — Full Name`}
                </label>
                <input
                  id={`${prefix}-guest-name-${index + 1}`}
                  name={`guestName${index + 1}`}
                  autoComplete={index === 0 ? "name" : "off"}
                  value={guestNames[index] ?? ""}
                  onChange={(event) =>
                    handleGuestNameChange(index, event.target.value)
                  }
                  placeholder="Enter full name"
                  maxLength={100}
                  required
                  disabled={isSubmitting || feedback?.type === "success"}
                />
              </div>
            ))}
          </div>

          <input
            className="rsvp-honeypot"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="rsvp-message-field rsvp-reveal">
            <label htmlFor={`${prefix}-message`}>
              A message for the couple <span>(optional)</span>
            </label>
            <textarea
              id={`${prefix}-message`}
              name="message"
              value={guestMessage}
              onChange={(event) =>
                handleGuestMessageChange(event.target.value)
              }
              placeholder="Share a note or a wish for us"
              maxLength={500}
              rows={4}
              disabled={isSubmitting || feedback?.type === "success"}
            />
            <span className="rsvp-message-count" aria-live="polite">
              {guestMessage.length}/500
            </span>
          </div>

          <fieldset
            className="rsvp-attendance rsvp-reveal"
            disabled={isSubmitting || feedback?.type === "success"}
          >
            <legend>Will you be joining us?</legend>
            <label
              className={`rsvp-option${
                response === "accept" ? " is-selected" : ""
              }`}
            >
              <input
                type="radio"
                name={`${prefix}-attendance`}
                value="accept"
                checked={response === "accept"}
                onChange={(event) => handleResponseChange(event.target.value)}
                disabled={feedback?.type === "success"}
                required
              />
              <AttendanceIcon type="accept" />
              <span>Joyfully accepts</span>
              <span className="rsvp-radio-mark" aria-hidden="true" />
            </label>
            <label
              className={`rsvp-option${
                response === "decline" ? " is-selected" : ""
              }`}
            >
              <input
                type="radio"
                name={`${prefix}-attendance`}
                value="decline"
                checked={response === "decline"}
                onChange={(event) => handleResponseChange(event.target.value)}
                disabled={feedback?.type === "success"}
              />
              <AttendanceIcon type="decline" />
              <span>Regretfully declines</span>
              <span className="rsvp-radio-mark" aria-hidden="true" />
            </label>
          </fieldset>

          <div
            className="rsvp-submit-group rsvp-reveal"
          >
            <button
              type="submit"
              className="submit-rsvp"
              disabled={isSubmitting || feedback?.type === "success"}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Sending…" : "Send my RSVP"}
            </button>
            {feedback && (
              <p
                className={`rsvp-message is-${feedback.type}`}
                role={feedback.type === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {feedback.text}
              </p>
            )}
            <p className="rsvp-reminder">
              Kindly honor the invitation as addressed. We appreciate your
              understanding.
            </p>
          </div>
          </form>
        )}

        <footer className="rsvp-signature rsvp-reveal">
          <RsvpFlourish heart />
          <strong>Sophea &amp; Francine</strong>
        </footer>
      </div>
    </section>
  );
}

export default RsvpSection;
