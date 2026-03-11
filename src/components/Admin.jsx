import { useEffect, useState } from 'react';
import { fetchNominees, fetchWinners } from '../utils/api';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO;

function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nominees, setNominees] = useState([]);
  const [winners, setWinners] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [noms, wins] = await Promise.all([fetchNominees(), fetchWinners()]);
      setNominees(noms);
      setWinners(wins || {});
    }
    loadData();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleWinnerChange = (categoryId, nomineeId) => {
    setWinners((prev) => ({
      ...prev,
      [categoryId]: nomineeId,
    }));
  };

  const handleSubmit = async () => {
    if (!GITHUB_TOKEN || GITHUB_TOKEN === 'your_github_pat_here') {
      alert('Please enter a valid VITE_GITHUB_TOKEN in .env');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/update-winners.yml/dispatches`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${GITHUB_TOKEN}`,
          },
          body: JSON.stringify({
            ref: 'main',
            inputs: {
              winners: JSON.stringify(winners, null, 2),
            },
          }),
        }
      );

      if (response.ok) {
        alert(
          'GitHub Action triggered successfully! The site will redeploy in a few minutes.'
        );
      } else {
        const errorData = await response.json();
        alert(`Error triggering action: ${errorData.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="app-container"
        style={{ textAlign: 'center', marginTop: '5rem' }}
      >
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1.5rem' }}>Admin Access</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="card"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%',
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (nominees.length === 0) {
    return <p className="loading-state">Loading categories...</p>;
  }

  return (
    <div className="app-container">
      <div style={{ marginBottom: '1rem' }}>
        <a href="#" className="btn-secondary">
          ← Back to Dashboard
        </a>
      </div>
      <div className="header" style={{ marginBottom: '2rem' }}>
        <h1 className="text-gold">Oscar Winners Selection</h1>
        <p className="subtitle">Select the true winners for each category</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'block' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {nominees.map((category) => (
            <div
              key={category.id}
              className="card"
              style={{ marginBottom: '1.5rem' }}
            >
              <div className="card-header">
                <h3>{category.name}</h3>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {category.nominees.map((nominee) => (
                  <label
                    key={nominee.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background:
                        winners[category.id] === nominee.id
                          ? 'rgba(212, 175, 55, 0.1)'
                          : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name={`category-${category.id}`}
                      value={nominee.id}
                      checked={winners[category.id] === nominee.id}
                      onChange={() =>
                        handleWinnerChange(category.id, nominee.id)
                      }
                      style={{ accentColor: 'var(--accent-gold)' }}
                    />
                    <span
                      style={{
                        color:
                          winners[category.id] === nominee.id
                            ? 'var(--accent-gold)'
                            : 'var(--text-primary)',
                      }}
                    >
                      {nominee.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div
            style={{
              position: 'sticky',
              bottom: '2rem',
              display: 'flex',
              justifyContent: 'center',
              zIndex: 100,
            }}
          >
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                padding: '1.5rem 3rem',
                height: 'auto',
                fontSize: '1.1rem',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Winners to GitHub'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
