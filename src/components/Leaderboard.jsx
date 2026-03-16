import React from 'react';

const SUBMISSION_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe7Yl60vNLwPL7ars31eFVxe0sNJxhXBHgRqi-N4JBpcHGypg/viewform?usp=sharing&ouid=103856445726433198576';

export default function Leaderboard({
  predictions = [],
  nominees = [],
  winners = {},
  dataUpdatedTime,
}) {
  const participants = predictions.map((p) => {
    let score = 0;

    // Calculate score based on winners
    nominees.forEach((category) => {
      const winnerData = winners[category.id];
      if (winnerData) {
        const winnerIds = Array.isArray(winnerData)
          ? winnerData
          : winnerData
            ? [winnerData]
            : [];
        const winnerNominees = category.nominees.filter((n) =>
          winnerIds.includes(n.id)
        );

        if (winnerNominees.length > 0) {
          const matched = winnerNominees.some(
            (wn) => p[category.name] === wn.name
          );
          if (matched) {
            score += category.points;
          }
        }
      }
    });

    return {
      name: p['Full Name'],
      score,
    };
  });

  participants.sort(
    (a, b) => b.score - a.score || a.name?.localeCompare(b.name || '') || 0
  );

  return (
    <aside className="leaderboard">
      <div className="card">
        <h2 className="text-gold card-header">Leaderboard</h2>

        <div className="leaderboard-scroll">
          {participants.length === 0 ? (
            <p className="empty-state">No participants yet.</p>
          ) : (
            <ul className="leaderboard-list">
              {participants.map((p, index) => (
                <li key={index} className="leaderboard-item">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span className="leaderboard-rank">{index + 1}.</span>
                    <span>{p.name}</span>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{p.score} pts</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="last-updated">
          Last checked: {dataUpdatedTime?.toLocaleTimeString() || '...'}
        </p>
      </div>
    </aside>
  );
}
