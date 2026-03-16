import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function CategoryCard({
  id,
  category,
  predictions,
  winners = {},
  isExpanded,
  shouldScroll,
  onToggle,
  isMobile,
}) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const cardRef = useRef(null);

  const winnerData = winners[id];
  const winnerIds = Array.isArray(winnerData)
    ? winnerData.map(String)
    : winnerData
      ? [String(winnerData)]
      : [];

  const hasWinner = winnerIds.length > 0;
  const winnerNominees = Object.values(category.nominees).filter((n) =>
    winnerIds.includes(String(n.id))
  );

  // Scroll into view when expanded
  useEffect(() => {
    if (isExpanded && isMobile && shouldScroll) {
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, isMobile, shouldScroll]);

  // Aggregate votes by nominee ID
  const votesById = {};
  const sortedNomineeIds = Object.keys(category.nominees).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  sortedNomineeIds.forEach((nid) => {
    votesById[nid] = 0;
  });

  predictions.forEach((p) => {
    const choiceId = String(p[id]);
    if (votesById[choiceId] !== undefined) {
      votesById[choiceId]++;
    }
  });

  const labels = sortedNomineeIds.map((nid) => category.nominees[nid].name);
  const voteCounts = sortedNomineeIds.map((nid) => votesById[nid]);

  const colors = [
    '#D4AF37',
    '#c0c0c0',
    '#cd7f32',
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#8b5cf6',
    '#f97316',
    '#ec4899',
    '#14b8a6',
    '#6366f1',
    '#f43f5e',
  ];

  const chartColors = sortedNomineeIds.map((nid, i) => {
    if (!hasWinner) return colors[i % colors.length];
    return winnerIds.includes(nid) ? '#e5e7eb' : 'rgba(128, 128, 128, 0.1)';
  });

  useEffect(() => {
    if (chartRef.current && isExpanded) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data: voteCounts,
              backgroundColor: chartColors,
              borderColor: hasWinner ? 'transparent' : '#1f2937',
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
          },
          cutout: '70%',
          maintainAspectRatio: false,
          responsive: true,
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [category, predictions, isExpanded, hasWinner, winnerIds]);

  return (
    <div
      ref={cardRef}
      className={`card category-card ${hasWinner ? 'has-winner' : ''}`}
    >
      <h3
        className={`card-header category-card-header ${
          hasWinner ? 'text-gold' : ''
        } ${isMobile ? 'is-mobile' : ''}`}
        onClick={isMobile ? onToggle : undefined}
      >
        <span className="category-title">
          {category.name}
          {hasWinner && <span style={{ fontSize: '0.8em' }}>✅</span>}
          {hasWinner && (
            <span className="points-badge">{category.points} pts</span>
          )}
        </span>
        {isMobile && (
          <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        )}
      </h3>
      {isExpanded && (
        <>
          {hasWinner ? (
            <div className="winner-container">
              <div className="winner-header">
                <span className="winner-label">
                  {winnerNominees.length > 1 ? 'WINNERS' : 'WINNER'}
                </span>
              </div>
              <div className="winner-name">
                {winnerNominees.map((wn) => wn.name).join(' & ')}
              </div>
              {predictions.length > 0 && (
                <div className="winner-stats">
                  {(
                    (winnerIds.reduce(
                      (acc, wid) => acc + (votesById[wid] || 0),
                      0
                    ) /
                      predictions.length) *
                    100
                  ).toFixed(1)}
                  % of participants correctly predicted this
                </div>
              )}
            </div>
          ) : (
            <div className="no-winner-info">
              Correct prediction earns{' '}
              <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                {category.points}
              </span>{' '}
              points
            </div>
          )}
          <div
            className="chart-container"
            style={{ opacity: hasWinner ? 0.9 : 1 }}
          >
            <div className="canvas-wrapper">
              <canvas ref={chartRef} />
            </div>
            <div className="custom-legend">
              {sortedNomineeIds.map((nid, i) => (
                <div key={nid} className="legend-item">
                  <span
                    className="legend-color-box"
                    style={{ backgroundColor: chartColors[i] }}
                  ></span>
                  <span className="legend-text">
                    <span className="legend-label">
                      {category.nominees[nid].name}
                    </span>
                    <span className="legend-value">{votesById[nid]}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
