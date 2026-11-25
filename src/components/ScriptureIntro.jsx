import { useEffect, useState } from "react";
import "./ScriptureIntro.css";

const assetBase = `${import.meta.env.BASE_URL}images/`;
const landingBase = `${assetBase}landing/`;
const bibleImage = `${assetBase}open-bible.webp`;

const essentialImages = [
  `${assetBase}bgmobile.webp`,
  `${assetBase}bgdesktop.webp`,
  `${assetBase}logo.webp`,
  `${landingBase}c1.webp`,
  `${landingBase}c2.webp`,
  `${landingBase}devider.webp`,
  `${landingBase}bottonbg.webp`,
  `${assetBase}2.webp`,
  bibleImage,
];

const particles = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  left: `${16 + Math.random() * 68}%`,
  top: `${28 + Math.random() * 20}%`,
  duration: `${2.8 + Math.random() * 1.4}s`,
  delay: `${-Math.random() * 6}s`,
  driftValue: -28 + Math.random() * 56,
  riseValue: -43 - Math.random() * 8,
}));

function preloadImage(url, cleanupCallbacks) {
  return new Promise((resolve) => {
    const preload = new window.Image();
    let settled = false;

    const finish = async (loaded) => {
      if (settled) return;
      settled = true;

      if (loaded && typeof preload.decode === "function") {
        try {
          await preload.decode();
        } catch {
          // A decoded image is preferred, but a loaded image is still usable.
        }
      }

      resolve(loaded);
    };

    preload.onload = () => finish(true);
    preload.onerror = () => finish(false);
    cleanupCallbacks.push(() => {
      preload.onload = null;
      preload.onerror = null;
    });
    preload.src = url;

    if (preload.complete) finish(preload.naturalWidth > 0);
  });
}

function preloadFonts() {
  if (!document.fonts) return Promise.resolve(true);

  const fontRequests = [
    '400 24px "Allura"',
    '400 24px "Italiana"',
    '400 16px "Playfair Display"',
    '400 16px "DM Sans"',
    '400 16px "Abruptly"',
  ];

  return Promise.all(
    fontRequests.map((font) => document.fonts.load(font).catch(() => [])),
  ).then(() => true);
}

function preloadAudioMetadata(audio, cleanupCallbacks) {
  if (!audio || audio.readyState >= 1) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (loaded) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      audio.removeEventListener("loadedmetadata", handleReady);
      audio.removeEventListener("error", handleError);
      resolve(loaded);
    };
    const handleReady = () => finish(true);
    const handleError = () => finish(false);
    const timeoutId = window.setTimeout(() => finish(false), 2500);

    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", handleReady, { once: true });
    audio.addEventListener("error", handleError, { once: true });
    cleanupCallbacks.push(() => {
      window.clearTimeout(timeoutId);
      audio.removeEventListener("loadedmetadata", handleReady);
      audio.removeEventListener("error", handleError);
    });
    audio.load();
  });
}

function ScriptureIntro({ audioRef, onTransitionStart, onComplete }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let deadlineTimer;
    let transitionTimer;
    const cleanupCallbacks = [];
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const minimumDuration = reducedMotion ? 1200 : 6000;
    const maximumWait = reducedMotion ? 4800 : 7100;
    const fadeDuration = reducedMotion ? 220 : 900;
    const startedAt = performance.now();
    let completedAssets = 0;
    const totalAssets = essentialImages.length + 2;

    const markAssetReady = () => {
      completedAssets += 1;
      if (!cancelled) setProgress(completedAssets / totalAssets);
    };

    const imageTasks = essentialImages.map((url) =>
      preloadImage(url, cleanupCallbacks).then((loaded) => {
        markAssetReady();
        return loaded;
      }),
    );
    const fontTask = preloadFonts().then((loaded) => {
      markAssetReady();
      return loaded;
    });
    const audioTask = preloadAudioMetadata(
      audioRef?.current,
      cleanupCallbacks,
    ).then((loaded) => {
      markAssetReady();
      return loaded;
    });
    const allAssetsReady = Promise.all([
      ...imageTasks,
      fontTask,
      audioTask,
    ]);
    const maximumWaitReached = new Promise((resolve) => {
      deadlineTimer = window.setTimeout(
        () => resolve(false),
        maximumWait,
      );
    });

    Promise.race([allAssetsReady, maximumWaitReached]).then(async () => {
      window.clearTimeout(deadlineTimer);
      const elapsed = performance.now() - startedAt;
      const remainingMinimum = Math.max(0, minimumDuration - elapsed);
      await new Promise((resolve) => {
        transitionTimer = window.setTimeout(resolve, remainingMinimum);
      });

      if (cancelled) return;
      onTransitionStart();
      setIsLeaving(true);
      transitionTimer = window.setTimeout(onComplete, fadeDuration);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(deadlineTimer);
      window.clearTimeout(transitionTimer);
      cleanupCallbacks.forEach((cleanup) => cleanup());
    };
  }, [audioRef, onComplete, onTransitionStart]);

  return (
    <div
      className={`scripture-intro${isLeaving ? " is-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scripture-intro-title"
    >
      <div className="scripture-intro-glow" aria-hidden="true" />
      <div className="scripture-intro-copy">
        <h1 className="scripture-intro-kicker" id="scripture-intro-title">
          HOLY MATRIMONY
        </h1>
        <p className="scripture-intro-verse">“Do everything in love.”</p>
        <span className="scripture-intro-divider" aria-hidden="true">
          <i />
        </span>
        <p className="scripture-intro-reference">1 CORINTHIANS 16:14</p>
      </div>

      <div className="scripture-bible-stage" aria-hidden="true">
        <div className="scripture-bible-halo" />
        <img className="scripture-bible-reflection" src={bibleImage} alt="" />
        <img className="scripture-bible" src={bibleImage} alt="" />
        <div className="scripture-bible-particles">
          {particles.map((particle) => (
            <span
              className="scripture-particle"
              key={particle.id}
              style={{
                left: particle.left,
                top: particle.top,
                "--particle-duration": particle.duration,
                "--particle-delay": particle.delay,
                "--particle-drift": `${particle.driftValue}px`,
                "--particle-drift-mid": `${particle.driftValue * 0.45}px`,
                "--particle-rise": `${particle.riseValue}vh`,
                "--particle-rise-mid": `${particle.riseValue * 0.45}vh`,
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="scripture-intro-loader"
        role="status"
        aria-label={`Preparing your experience, ${Math.round(progress * 100)} percent`}
      >
        <span>PREPARING YOUR EXPERIENCE</span>
        <span className="scripture-loader-track" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </span>
      </div>
    </div>
  );
}

export default ScriptureIntro;
