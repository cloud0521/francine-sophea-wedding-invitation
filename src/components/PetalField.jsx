import { useEffect, useRef } from "react";

const petalSources = ["p1.png", "p2.png", "p3.png", "p4.png"].map(
  (filename) => `${import.meta.env.BASE_URL}images/petals/${filename}`,
);

const MAX_SETTLED_PETALS = 20;
const MAX_FALLING_PETALS = 6;

const randomBetween = (minimum, maximum) =>
  Math.random() * (maximum - minimum) + minimum;

function PetalField() {
  const fieldRef = useRef(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let isVisible = false;
    let timerId;

    const pause = () => {
      field.classList.add("is-paused");
      window.clearTimeout(timerId);
      timerId = undefined;
    };

    const createPetal = ({ startY: initialTop, left: initialLeft } = {}) => {
      const fallingCount = field.querySelectorAll(
        ".story-petal:not(.is-settled)",
      ).length;

      if (fallingCount >= MAX_FALLING_PETALS) return;

      const isMobile = window.innerWidth <= 800;
      const rotation = randomBetween(-180, 180);
      const sway = randomBetween(15, 40);
      const swayDirection = Math.random() > 0.5 ? 1 : -1;
      const size = isMobile
        ? randomBetween(12, 28)
        : randomBetween(16, 34);
      const startY = initialTop ?? -size;
      const fallDistance = Math.max(
        0,
        field.clientHeight - size - startY,
      );
      const fallProgress = Math.min(
        1,
        Math.max(0.35, fallDistance / field.clientHeight),
      );
      const duration = randomBetween(12, 19) * fallProgress;
      const horizontalPosition =
        initialLeft ??
        randomBetween(0, Math.max(0, field.clientWidth - size));
      const petal = document.createElement("span");
      const image = document.createElement("img");

      petal.className = "story-petal";
      petal.style.left = `${horizontalPosition}px`;
      petal.style.top = `${startY}px`;
      petal.style.setProperty("--petal-size", `${size}px`);
      petal.style.setProperty("--fall-distance", `${fallDistance}px`);
      petal.style.setProperty("--fall-duration", `${duration}s`);
      petal.style.setProperty(
        "--sway-distance",
        `${sway * swayDirection}px`,
      );
      petal.style.setProperty(
        "--sway-return",
        `${-sway * 0.7 * swayDirection}px`,
      );
      petal.style.setProperty("--rotation-start", `${rotation}deg`);
      petal.style.setProperty(
        "--rotation-middle",
        `${rotation + randomBetween(-55, 55)}deg`,
      );
      petal.style.setProperty(
        "--rotation-end",
        `${rotation + randomBetween(-85, 85)}deg`,
      );

      image.src =
        petalSources[Math.floor(Math.random() * petalSources.length)];
      image.alt = "";
      image.draggable = false;
      petal.append(image);
      petal.addEventListener("animationend", (event) => {
        if (event.target !== petal) return;

        const settledPetals = field.querySelectorAll(
          ".story-petal.is-settled:not(.is-exiting)",
        );

        if (settledPetals.length >= MAX_SETTLED_PETALS) {
          const oldestPetal = settledPetals[0];
          if (oldestPetal) {
            oldestPetal.style.setProperty(
              "--exit-distance",
              `${randomBetween(42, 72)}px`,
            );
            oldestPetal.style.setProperty(
              "--exit-drift",
              `${randomBetween(-22, 22)}px`,
            );
            oldestPetal.classList.add("is-exiting");
            oldestPetal.addEventListener(
              "animationend",
              (exitEvent) => {
                if (exitEvent.target === oldestPetal) oldestPetal.remove();
              },
              { once: true },
            );
          }
        }

        petal.style.top = "auto";
        petal.style.bottom = "0px";
        petal.classList.add("is-settled");
      });
      field.append(petal);
    };

    const seedInitialPetals = () => {
      if (field.dataset.seeded === "true") return;
      field.dataset.seeded = "true";

      for (let index = 0; index < 12; index += 1) {
        const isMobile = window.innerWidth <= 800;
        const size = isMobile
          ? randomBetween(14, 26)
          : randomBetween(18, 32);
        const petal = document.createElement("span");
        const image = document.createElement("img");

        petal.className = "story-petal is-settled";
        petal.style.left = `${randomBetween(2, 94)}%`;
        petal.style.top = "auto";
        petal.style.bottom = "0px";
        petal.style.setProperty("--petal-size", `${size}px`);
        petal.style.setProperty("--rotation-start", `${randomBetween(-180, 180)}deg`);
        image.src =
          petalSources[Math.floor(Math.random() * petalSources.length)];
        image.alt = "";
        image.draggable = false;
        petal.append(image);
        field.append(petal);
      }

      const initialFallingPositions = [
        { left: field.clientWidth * randomBetween(0.08, 0.2), top: 0.34 },
        { left: field.clientWidth * randomBetween(0.78, 0.9), top: 0.47 },
        { left: field.clientWidth * randomBetween(0.35, 0.65), top: 0.58 },
      ];

      initialFallingPositions.forEach(({ left, top }) => {
        createPetal({
          left,
          startY: field.clientHeight * top,
        });
      });
    };

    const schedulePetal = () => {
      if (!isVisible || reducedMotion.matches) return;

      timerId = window.setTimeout(() => {
        createPetal();
        schedulePetal();
      }, randomBetween(1500, 3000));
    };

    const start = () => {
      if (!isVisible || reducedMotion.matches || timerId) return;

      field.classList.remove("is-paused");
      seedInitialPetals();
      createPetal();
      schedulePetal();
    };

    const handleMotionChange = () => {
      if (reducedMotion.matches) {
        pause();
        field.replaceChildren();
      } else {
        start();
      }
    };

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              isVisible = entry.isIntersecting;
              if (isVisible) {
                start();
              } else {
                pause();
              }
            },
            { threshold: 0.05 },
          )
        : null;

    field.classList.add("is-paused");
    observer?.observe(field);
    if (!observer) {
      isVisible = true;
      start();
    }

    reducedMotion.addEventListener("change", handleMotionChange);

    return () => {
      window.clearTimeout(timerId);
      observer?.disconnect();
      reducedMotion.removeEventListener("change", handleMotionChange);
      field.replaceChildren();
    };
  }, []);

  return (
    <div
      className="story-petal-field"
      ref={fieldRef}
      aria-hidden="true"
    />
  );
}

export default PetalField;
