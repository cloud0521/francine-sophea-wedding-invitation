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
