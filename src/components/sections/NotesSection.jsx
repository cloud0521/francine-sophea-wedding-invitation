import { useEffect, useRef, useState } from "react";
import NotesFlowerField from "../NotesFlowerField";

const faqItems = [
  {
    id: "arrival",
    icon: "clock",
    question: "What time should I arrive?",
    answer:
      "Kindly arrive by 1:00 PM so you can settle in before the ceremony begins.",
  },
  {
    id: "plus-one",
    icon: "people",
    question: "May I bring a plus-one?",
    answer:
      "Due to limited space and seating arrangements, we kindly ask that only invited guests attend. We sincerely appreciate your understanding.",
  },
  {
    id: "children",
    icon: "baby",
    question: "May I bring my children?",
    answer:
      "Whenever possible, we kindly encourage our guests to make arrangements for their little ones and enjoy the celebration with us. Thank you for your understanding.",
  },
  {
    id: "photos",
    icon: "camera",
    question: "May I take photos and videos?",
    answer:
      "Absolutely! Feel free to capture the beautiful moments of our special day. We would love to see the memories you create.",
  },
];

function NoteIcon({ name, className = "" }) {
  const common = {
    className: `notes-icon ${className}`,
    viewBox: "0 0 32 32",
    fill: "none",
    "aria-hidden": true,
  };

  switch (name) {
    case "clock":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="10.5" />
          <path d="M16 9.5v7l4.5 2.5" />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <circle cx="12" cy="11" r="3.5" />
          <circle cx="21" cy="12" r="3" />
          <path d="M5.5 24c.4-4.1 2.7-6.3 6.5-6.3s6.1 2.2 6.5 6.3m-.3-5.1c3.8-.8 7.8 1 8.3 5.1" />
        </svg>
      );
    case "baby":
      return (
        <svg {...common}>
          <path d="M8 15.5a8 8 0 0 1 16 0v5a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4v-5Z" />
          <path d="M12 17h.1m7.8 0h.1M13 21c1.8 1.5 4.2 1.5 6 0M11 9.5c1.3-2 3-3 5-3s3.7 1 5 3" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M5.5 11h5l2-3h7l2 3h5v13h-21V11Z" />
          <circle cx="16" cy="17.5" r="4" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <path d="M5 14h22v14H5V14Zm-2-5h26v5H3V9Zm13 5v14M16 9c-1.5-6-9-5-7-1 1 2 5 2 7 1Zm0 0c1.5-6 9-5 7-1-1 2-5 2-7 1Z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M16 26S5 19 5 11.8A5.8 5.8 0 0 1 16 9.2a5.8 5.8 0 0 1 11 2.6C27 19 16 26 16 26Z" />
        </svg>
      );
    case "celebration":
      return (
        <svg {...common}>
          <path d="m8 24 3-11 10 8-13 3Zm3-11L7 8m14 13 5 1m-5-1 2-5M16 7V4m8 7 3-2M5 17l-3 1" />
          <path d="m11 13 10 8" />
        </svg>
      );
    default:
      return null;
  }
}

function NotesFlourish() {
  return (
    <svg className="notes-flourish" viewBox="0 0 120 24" aria-hidden="true">
      <path d="M2 12h39m38 0h39" />
      <path d="m60 4 8 8-8 8-8-8 8-8Z" />
      <path d="M43 12c5-5 11-5 17 0m17 0c-5-5-11-5-17 0" />
      <circle cx="47" cy="12" r="1.25" />
      <circle cx="73" cy="12" r="1.25" />
    </svg>
  );
}

function AccordionItem({ item, isOpen, onToggle }) {
  const answerId = `notes-answer-${item.id}`;

  return (
    <article className={`notes-faq-item${isOpen ? " is-open" : ""}`}>
      <button
        className="notes-faq-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={onToggle}
      >
        <NoteIcon name={item.icon} className="notes-faq-icon" />
        <span className="notes-faq-question">{item.question}</span>
        <span className="notes-faq-toggle" aria-hidden="true" />
      </button>
      <div
        className="notes-faq-answer"
        id={answerId}
        aria-hidden={!isOpen}
      >
        <div className="notes-faq-answer-inner">
          <p>{item.answer}</p>
        </div>
      </div>
    </article>
  );
}

function NotesSection() {
  const sectionRef = useRef(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const revealGroups = section.querySelectorAll(".notes-reveal");
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
      id="notes"
      className="notes-chapter chapter-card thoughtful-notes"
      aria-label="Wedding Notes"
    >
      <NotesFlowerField />
      <header className="notes-header notes-reveal">
        <NotesFlourish />
        <h2>Thoughtful Notes</h2>
        <p>A few little things, with much love.</p>
      </header>

      <section className="notes-gift notes-reveal" aria-labelledby="notes-gift-title">
        <NoteIcon name="gift" className="notes-gift-icon" />
        <h3 id="notes-gift-title">Gift Guide</h3>
        <p className="notes-gift-highlight">Your presence is our greatest present.</p>
        <div className="notes-gift-copy">
          <p>
            With all that we have, we are truly blessed. Your presence and
            prayers are all that we request.
          </p>
          <p>
            Should you wish to give us something to help us on our new journey,
            a monetary gift would be warmly appreciated. If you prefer to give
            a present, please feel free to surprise us.
          </p>
        </div>
      </section>

      <NotesFlourish />

      <section className="notes-faq notes-reveal" aria-labelledby="notes-faq-title">
        <header className="notes-subheading">
          <h3 id="notes-faq-title">A Few Things to Know</h3>
          <p>Tap a question to learn more.</p>
        </header>
        <div className="notes-faq-list">
          {faqItems.map((item) => (
            <AccordionItem
              key={item.id}
              item={item}
              isOpen={openQuestion === item.id}
              onToggle={() =>
                setOpenQuestion((current) =>
                  current === item.id ? null : item.id,
                )
              }
            />
          ))}
        </div>
      </section>

      <NotesFlourish />

      <section className="notes-reminders notes-reveal" aria-labelledby="notes-reminders-title">
        <h3 id="notes-reminders-title">Gentle Reminders</h3>
        <ul>
          <li>
            <NoteIcon name="clock" />
            <span>Be on time.</span>
          </li>
          <li>
            <NoteIcon name="heart" />
            <span>Stay until the celebration ends.</span>
          </li>
          <li>
            <NoteIcon name="celebration" />
            <span>Have fun and make beautiful memories!</span>
          </li>
        </ul>
      </section>

    </section>
  );
}

export default NotesSection;
