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

  const winnerId = winners[category.id];
  const winnerNominee = category.nominees.find((n) => n.id === winnerId);

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
    if (!winnerNominee) return colors[i % colors.length];
    return name === winnerNominee.name ? '#e5e7eb' : 'rgba(128, 128, 128, 0.1)';
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
              borderColor: winnerNominee ? 'transparent' : '#1f2937',
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
  }, [category, predictions, isExpanded, winnerNominee]);

  return (
    <div
      ref={cardRef}
      className="card category-card"
      style={{
        borderColor: winnerNominee
          ? 'var(--accent-gold)'
          : 'var(--border-color)',
        boxShadow: winnerNominee ? '0 0 15px rgba(212, 175, 55, 0.1)' : 'none',
      }}
    >
      <h3
        className="text-gold card-header"
        onClick={isMobile ? onToggle : undefined}
        style={{
          cursor: isMobile ? 'pointer' : 'default',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: isMobile ? 'none' : 'auto',
          color: winnerNominee ? 'var(--accent-gold)' : 'var(--text-primary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {category.name}
          {winnerNominee && <span style={{ fontSize: '0.8em' }}>✅</span>}
        </span>
        {isMobile && (
          <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        )}
      </h3>
      {isExpanded && (
        <>
          {winnerNominee && (
            <div
              style={{
                textAlign: 'center',
                padding: '0.75rem',
                marginBottom: '0.75rem',
                background: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              <span
                style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
              >
                WINNER
              </span>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: 'var(--accent-gold)',
                  lineHeight: '1.2',
                }}
              >
                {winnerNominee.name}
              </div>
              {predictions.length > 0 && (
                <div
                  style={{
                    marginTop: '0.25rem',
                    color: '#e5e7eb',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    opacity: 0.9,
                  }}
                >
                  {(
                    ((votes[winnerNominee.name] || 0) / predictions.length) *
                    100
                  ).toFixed(1)}
                  % of participants correctly predicted this
                </div>
              )}
            </div>
          )}
          <div
            className="chart-container"
            style={{ opacity: winnerNominee ? 0.9 : 1 }}
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
