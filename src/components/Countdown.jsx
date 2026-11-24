import { useEffect, useState } from "react";

function Countdown() {
  const getTimeRemaining = () => {
    const difference =
      new Date("2026-12-29T14:00:00+08:00").getTime() - Date.now();

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / 86400000),
      hours: Math.floor((difference / 3600000) % 24),
      minutes: Math.floor((difference / 60000) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [time, setTime] = useState(getTimeRemaining);

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeRemaining()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <p className="countdown-complete" role="status">
        The day has arrived — let’s celebrate!
      </p>
    );
  }

  return (
    <div
      className="countdown"
      aria-label={`${time.days} days until the wedding`}
    >
      {Object.entries(time).map(([label, value]) => (
        <div className="countdown-unit" key={label}>
          <span className="countdown-number-window" aria-hidden="true">
            <span className="countdown-number" key={value}>
              {String(value).padStart(2, "0")}
            </span>
          </span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

export default Countdown;
