import { useEffect, useState } from 'react';
import Header from './Header';
import CategoryCard from './CategoryCard';
import Leaderboard from './Leaderboard';
import Admin from './Admin';
import { fetchSheetData, fetchNominees, fetchWinners } from '../utils/api';
import { TARGET_DATE, SHEET_URL, POLLING_DURATION_MS } from '../utils/config';

function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);
  const [dataUpdatedTime, setDataUpdatedTime] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [winners, setWinners] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 900 : false
  );
  const [lastToggledId, setLastToggledId] = useState(null);

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Polling logic setup
    const pollData = async () => {
      console.log('Fetching Google Sheets, Nominees, and Winners...');
      try {
        const [sheetData, nomineesData, winnersData] = await Promise.all([
          fetchSheetData(SHEET_URL),
          fetchNominees(),
          fetchWinners(),
        ]);
        setPredictions(sheetData);
        setNominees(nomineesData);
        setWinners(winnersData);
        setDataUpdatedTime(new Date());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    pollData();

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const endTime = TARGET_DATE + POLLING_DURATION_MS;
      if (now >= TARGET_DATE && now <= endTime) {
        pollData();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const toggleCategory = (id) => {
    setLastToggledId(id);
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  const expandAll = () => {
    setLastToggledId(null);
    setExpandedCategories({});
  };

  const collapseAll = () => {
    setLastToggledId(null);
    const collapsedState = {};
    nominees.forEach((c) => {
      collapsedState[c.id] = false;
    });
    setExpandedCategories(collapsedState);
  };

  if (currentRoute === '#admin') {
    return <Admin />;
  }

  return (
    <div className="app-container">
      <Header />

      <div className="dashboard-grid">
        <main className="categories-list">
          {nominees.length > 0 && isMobile && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <button className="btn-secondary" onClick={expandAll}>
                Expand All
              </button>
              <button className="btn-secondary" onClick={collapseAll}>
                Collapse All
              </button>
            </div>
          )}
          {nominees.length === 0 ? (
            <p className="loading-state">Loading categories...</p>
          ) : (
            nominees.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                predictions={predictions}
                winners={winners}
                isExpanded={
                  !isMobile || (expandedCategories[category.id] ?? true)
                }
                shouldScroll={lastToggledId === category.id}
                onToggle={() => isMobile && toggleCategory(category.id)}
                isMobile={isMobile}
              />
            ))
          )}
        </main>

        <Leaderboard
          predictions={predictions}
          nominees={nominees}
          winners={winners}
          dataUpdatedTime={dataUpdatedTime}
        />
      </div>
    </div>
  );
}

export default App;
