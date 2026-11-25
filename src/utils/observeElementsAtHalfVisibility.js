export function observeElementsAtHalfVisibility(elements) {
  const targets = Array.from(elements);

  if (!("IntersectionObserver" in window)) {
    targets.forEach((element) => element.classList.add("is-visible"));
    return () => {};
  }

  const hasReachedHalf = new WeakSet();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const element = entry.target;

        if (entry.intersectionRatio >= 0.5) {
          hasReachedHalf.add(element);
          element.classList.add("is-visible");
        } else if (!entry.isIntersecting) {
          hasReachedHalf.delete(element);
          element.classList.remove("is-visible");
        } else if (hasReachedHalf.has(element)) {
          element.classList.remove("is-visible");
        } else {
          element.classList.add("is-visible");
        }
      });
    },
    { threshold: [0, 0.5] },
  );

  targets.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
}

export function observeCornerFlowers(elements) {
  const targets = Array.from(elements);
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion) {
    targets.forEach((element) => element.classList.add("is-visible"));
    return () => {};
  }

  const handleFadeComplete = (event) => {
    if (event.propertyName !== "opacity") return;

    const flower = event.currentTarget;
    flower.classList.toggle(
      "is-swaying",
      flower.classList.contains("is-visible"),
    );
  };

  targets.forEach((element) => {
    element.addEventListener("transitionend", handleFadeComplete);
  });

  if (!("IntersectionObserver" in window)) {
    targets.forEach((element) => element.classList.add("is-visible"));
    return () => {
      targets.forEach((element) => {
        element.removeEventListener("transitionend", handleFadeComplete);
      });
    };
  }

  const hasReachedHalf = new WeakSet();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const flower = entry.target;

        if (entry.intersectionRatio >= 0.5) {
          hasReachedHalf.add(flower);
          flower.classList.add("is-visible");
        } else if (!entry.isIntersecting) {
          hasReachedHalf.delete(flower);
          flower.classList.remove("is-visible");
        } else if (hasReachedHalf.has(flower)) {
          flower.classList.remove("is-visible");
        } else {
          flower.classList.add("is-visible");
        }
      });
    },
    { threshold: [0, 0.5] },
  );

  targets.forEach((element) => observer.observe(element));
  return () => {
    observer.disconnect();
    targets.forEach((element) => {
      element.removeEventListener("transitionend", handleFadeComplete);
    });
  };
}
