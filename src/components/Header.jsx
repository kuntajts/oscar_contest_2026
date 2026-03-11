import { useState, useEffect } from 'react';

import { TARGET_DATE, SUBMISSION_FORM_URL } from '../utils/config';

export default function Header() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const isLive = !timeLeft;

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const difference = TARGET_DATE - now;

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <h1>2026 Oscar Pool</h1>
      <p className="subtitle">
        Compete with friends and watch the results live.
      </p>

      <div className="header-actions">
        <div
          className={`status-badge ${isLive ? 'status-live' : 'status-predicting'}`}
        >
          {isLive ? '🏆 Live Results' : 'Accepting Predictions'}
        </div>

        {!isLive && (
          <a
            href={SUBMISSION_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Submit Your Guesses
          </a>
        )}
      </div>

      {!isLive && timeLeft && (
        <div className="countdown">
          <div className="countdown-item">
            <span className="countdown-value">{timeLeft.days}</span>
            <span className="countdown-label">Days</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-value">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="countdown-label">Hours</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-value">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="countdown-label">Mins</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-value">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="countdown-label">Secs</span>
          </div>
        </div>
      )}
    </header>
  );
}
