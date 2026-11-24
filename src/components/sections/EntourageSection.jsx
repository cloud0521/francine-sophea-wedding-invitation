import { useEffect, useRef } from "react";
import { entourageGroups } from "../../data/weddingContent.js";

const dustSpecks = [
  [8, 18, 0, 8], [22, 34, 2.4, 10], [90, 20, 1.2, 9], [96, 42, 4.1, 11],
  [5, 56, 3.2, 9], [15, 78, 5.6, 12], [84, 68, 2.8, 10], [94, 86, 6.2, 9],
  [28, 92, 4.8, 11], [72, 12, 6.7, 10], [3, 37, 7.3, 12], [98, 61, 1.8, 8],
  [39, 16, 5.2, 9], [66, 88, 3.7, 11], [52, 24, 1.6, 10], [58, 52, 6.4, 9],
  [34, 66, 2.1, 12], [73, 36, 7.1, 10], [48, 83, 4.5, 11], [18, 47, 0.8, 9],
  [81, 95, 5.9, 12], [45, 8, 3.1, 10], [61, 8, 6.8, 11], [32, 28, 7.5, 9],
  [45, 42, 1.9, 12], [25, 59, 4.2, 10], [62, 68, 0.4, 9], [77, 57, 5.3, 11],
  [41, 98, 2.7, 10], [8, 90, 7.8, 12], [89, 8, 3.6, 9], [54, 96, 6.1, 11],
];

function NameList({ people, className = "" }) {
  return (
    <ul className={`entourage-name-list ${className}`}>
      {people.map((person) => (
        <li key={person}>{person}</li>
      ))}
    </ul>
  );
}

function EntourageGroup({ title, people, className = "" }) {
  return (
    <section className={`entourage-group entourage-reveal ${className}`}>
      <h3>{title}</h3>
      <NameList people={people} />
    </section>
  );
}

function PairedGroups({ groups, className = "", title }) {
  return (
    <section className={`entourage-paired-section entourage-reveal ${className}`}>
      {title && <h3>{title}</h3>}
      <div className="entourage-pair">
        {groups.map((group) => (
          <section className="entourage-group" key={group.title}>
            <h3>{group.title}</h3>
            <NameList people={group.people} />
          </section>
        ))}
      </div>
    </section>
  );
}

function StructuredGroup({ title, entries }) {
  return (
    <section className="entourage-group entourage-reveal">
      <h3>{title}</h3>
      <div className="entourage-role-grid">
        {entries.map(({ role, name }) => (
          <div className="entourage-role-entry" key={`${role}-${name}`}>
            <h4>{role}</h4>
            <p>{name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function splitRole(entries) {
  return entries.map((entry) => {
    const [role, ...nameParts] = entry.split("·");
    return { role: role.trim(), name: nameParts.join("·").trim() };
  });
}

function EntourageSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const revealGroups = section.querySelectorAll(".entourage-reveal");
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
          entry.target.classList.toggle("is-revealed", entry.isIntersecting);
        });
      },
      { threshold: 0 },
    );

    revealGroups.forEach((group) => observer.observe(group));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const field = sectionRef.current?.querySelector(".entourage-dust-field");
    if (!field) return undefined;

    const specks = [...field.children];
    const handlers = specks.map((speck) => {
      const moveToNewPosition = () => {
        let x = 0;
        let y = 0;
        let hasSpace = false;
        let attempts = 0;

        while (!hasSpace && attempts < 30) {
          x = 6 + Math.random() * 88;
          y = 8 + Math.random() * 84;
          hasSpace = specks.every((other) => {
            if (other === speck) return true;
            const otherX = Number.parseFloat(other.style.getPropertyValue("--dust-x"));
            const otherY = Number.parseFloat(other.style.getPropertyValue("--dust-y"));
            return Math.hypot(x - otherX, y - otherY) > 12;
          });
          attempts += 1;
        }

        speck.style.setProperty("--dust-x", `${x}%`);
        speck.style.setProperty("--dust-y", `${y}%`);
      };

      speck.addEventListener("animationiteration", moveToNewPosition);
      return () => speck.removeEventListener("animationiteration", moveToNewPosition);
    });

    return () => handlers.forEach((removeHandler) => removeHandler());
  }, []);

  const getPeople = (title) =>
    entourageGroups.find((group) => group.title === title)?.people ?? [];
  const parents = getPeople("Parents");
  const sponsorNames = getPeople("Principal Sponsors");
  const sponsorRows = [
    ...Array.from({ length: 17 }, (_, index) =>
      sponsorNames.slice(index * 2, index * 2 + 2),
    ),
    sponsorNames.slice(34, 37),
    sponsorNames.slice(37, 40),
    sponsorNames.slice(40, 43),
    sponsorNames.slice(43, 46),
    sponsorNames.slice(46, 48),
    sponsorNames.slice(48, 50),
    sponsorNames.slice(50, 52),
  ].filter((row) => row.length > 0);

  return (
    <section
      ref={sectionRef}
      className="entourage chapter-card entourage-editorial"
      id="entourage"
      aria-label="Wedding Entourage"
    >
      <div className="entourage-dust-field" aria-hidden="true">
        {dustSpecks.map(([x, y, delay, duration], index) => (
          <span
            className="entourage-dust-speck"
            key={index}
            style={{
              "--dust-x": `${x}%`,
              "--dust-y": `${y}%`,
              "--dust-delay": `${delay}s`,
              "--dust-duration": `${duration}s`,
            }}
          />
        ))}
      </div>
      <header className="entourage-editorial-heading entourage-reveal">
        <span className="entourage-ornament" aria-hidden="true">
          <span />
        </span>
        <h2>Our Entourage</h2>
        <p>The beautiful souls who stand beside us.</p>
      </header>

      <EntourageGroup
        title="Officiating Priest"
        people={getPeople("Officiating Priest")}
        className="entourage-priest"
      />
      <PairedGroups
        className="entourage-parents"
        title="Our Beloved Parents"
        groups={[
          { title: "Parents of the Groom", people: parents.slice(0, 2) },
          { title: "Parents of the Bride", people: parents.slice(2) },
        ]}
      />
      <PairedGroups
        groups={[
          { title: "Maid of Honor", people: getPeople("Maid of Honor") },
          { title: "Best Man", people: getPeople("Best Man") },
        ]}
      />
      <PairedGroups
        groups={[
          { title: "Bridesmaids", people: getPeople("Bridal Party") },
          { title: "Groomsmen", people: getPeople("Groomsmen") },
        ]}
      />
      <StructuredGroup
        title="Secondary Sponsors"
        entries={splitRole(getPeople("Secondary Sponsors"))}
      />
      <StructuredGroup
        title="Bearers"
        entries={splitRole(getPeople("Bearers"))}
      />
      <EntourageGroup
        title="Flower Girls"
        people={getPeople("Flower Girls")}
      />
      <section className="entourage-group entourage-reveal entourage-principal-group">
        <h3>Principal Sponsors</h3>
        <div className="entourage-principal-rows">
          {sponsorRows.map((row, index) => (
            <ul
              className={`entourage-principal-row${
                row.length === 3 ? " has-three-columns" : ""
              }`}
              key={`sponsor-row-${index}`}
              style={{ "--sponsor-columns": row.length }}
            >
              {row.map((person) => (
                <li key={person}>{person}</li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      <p className="entourage-closing entourage-reveal">
        With love and gratitude.
      </p>
    </section>
  );
}

export default EntourageSection;
