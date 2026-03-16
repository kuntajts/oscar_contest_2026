import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function CategoryCard({
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

  const winnerData = winners[category.id];
  const winnerIds = Array.isArray(winnerData)
    ? winnerData
    : winnerData
      ? [winnerData]
      : [];
  const winnerNominees = category.nominees.filter((n) =>
    winnerIds.includes(n.id)
  );
  const hasWinner = winnerNominees.length > 0;

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

  const votes = {};
  category.nominees.forEach((n) => {
    votes[n.name] = 0;
  });

  predictions.forEach((p) => {
    const choice = p[category.name];
    if (choice) {
      if (votes[choice] !== undefined) {
        votes[choice]++;
      } else {
        votes[choice] = 1;
      }
    }
  });

  const labels = Object.keys(votes);
  const data = labels.map((k) => votes[k]);

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

  const chartColors = labels.map((name, i) => {
    if (!hasWinner) return colors[i % colors.length];
    const isWinner = winnerNominees.some((wn) => wn.name === name);
    return isWinner ? '#e5e7eb' : 'rgba(128, 128, 128, 0.1)';
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
              data,
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
  }, [category, predictions, isExpanded, hasWinner, winnerNominees]);

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
                    (winnerNominees.reduce(
                      (acc, wn) => acc + (votes[wn.name] || 0),
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
              {labels.map((label, i) => (
                <div key={i} className="legend-item">
                  <span
                    className="legend-color-box"
                    style={{ backgroundColor: chartColors[i] }}
                  ></span>
                  <span className="legend-text">
                    <span className="legend-label">{label}</span>
                    <span className="legend-value">{data[i]}</span>
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
