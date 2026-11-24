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

    const createPetal = () => {
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
      const startY = -size;
      const fallDistance = field.clientHeight;
      const duration = randomBetween(12, 19);
      const horizontalPosition = randomBetween(
        0,
        Math.max(0, field.clientWidth - size),
      );
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

        const landedCount = field.querySelectorAll(
          ".story-petal.is-settled",
        ).length;

        if (landedCount >= MAX_SETTLED_PETALS) {
          field.querySelector(".story-petal.is-settled")?.remove();
        }

        petal.style.top = "auto";
        petal.style.bottom = "0px";
        petal.classList.add("is-settled");
      });
      field.append(petal);
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
