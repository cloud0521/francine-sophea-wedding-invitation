import { useEffect, useRef } from "react";

const flowerSources = ["f1.webp", "f2.webp", "f3.webp"].map(
  (filename) => `${import.meta.env.BASE_URL}images/webp/flowers/${filename}`,
);

const MAX_FLOWERS = 6;
const randomBetween = (minimum, maximum) =>
  Math.random() * (maximum - minimum) + minimum;

function NotesFlowerField() {
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

    const createFlower = () => {
      const activeFlowers = field.querySelectorAll(
        ".notes-falling-flower:not(.is-finished)",
      ).length;
      if (activeFlowers >= MAX_FLOWERS) return;

      const size = randomBetween(22, window.innerWidth <= 600 ? 38 : 46);
      const flower = document.createElement("span");
      const image = document.createElement("img");
      const duration = randomBetween(10, 16);
      const drift = randomBetween(-44, 44);
      const rotation = randomBetween(-45, 45);

      flower.className = "notes-falling-flower";
      flower.style.left = `${randomBetween(
        0,
        Math.max(0, field.clientWidth - size),
      )}px`;
      flower.style.top = `${-size}px`;
      flower.style.setProperty("--flower-size", `${size}px`);
      flower.style.setProperty(
        "--flower-fall",
        `${field.clientHeight + size}px`,
      );
      flower.style.setProperty("--flower-duration", `${duration}s`);
      flower.style.setProperty("--flower-drift", `${drift}px`);
      flower.style.setProperty("--flower-rotation", `${rotation}deg`);
      flower.style.setProperty("--flower-drift-middle", `${drift * 0.45}px`);
      flower.style.setProperty("--flower-drift-return", `${drift * -0.25}px`);
      flower.style.setProperty(
        "--flower-fall-middle",
        `${field.clientHeight * 0.32}px`,
      );
      flower.style.setProperty(
        "--flower-fall-late",
        `${field.clientHeight * 0.68}px`,
      );
      flower.style.setProperty(
        "--flower-rotation-middle",
        `${rotation * 0.35}deg`,
      );
      flower.style.setProperty(
        "--flower-rotation-late",
        `${rotation * 0.7}deg`,
      );

      image.src =
        flowerSources[Math.floor(Math.random() * flowerSources.length)];
      image.alt = "";
      image.draggable = false;
      flower.append(image);
      flower.addEventListener("animationend", () => {
        flower.classList.add("is-finished");
        flower.remove();
      });
      field.append(flower);
    };

    const scheduleFlower = () => {
      if (!isVisible || reducedMotion.matches) return;
      timerId = window.setTimeout(() => {
        createFlower();
        scheduleFlower();
      }, randomBetween(1400, 2600));
    };

    const start = () => {
      if (!isVisible || reducedMotion.matches || timerId) return;
      field.classList.remove("is-paused");
      createFlower();
      scheduleFlower();
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
        ? new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            if (isVisible) start();
            else pause();
          })
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
      className="notes-flower-field"
      ref={fieldRef}
      aria-hidden="true"
    />
  );
}

export default NotesFlowerField;
