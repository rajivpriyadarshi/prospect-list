import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ScheduledPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [showCheck, setShowCheck] = useState(false);

  // Check if already scheduled on mount
  const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
  const isAlreadyScheduled = savedSearches.some((s: { query: string }) => s.query === query);
  const [isLoading, setIsLoading] = useState(!isAlreadyScheduled);

  const getRandomAccentColor = () => {
    const colors = ['#9c6ccd', '#7bd5ff', '#f8ff7b', '#82fed6', '#ff7b7b', '#7bffa5'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    if (isAlreadyScheduled) {
      // Already scheduled - skip loader, show check
      setTimeout(() => setShowCheck(true), 300);
      return;
    }

    // New search - show loader then save
    const loaderTimer = setTimeout(() => {
      // Save to localStorage
      if (query) {
        const currentSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
        const alreadyExists = currentSearches.some((s: { query: string }) => s.query === query);

        if (!alreadyExists) {
          const newSearch = {
            id: Date.now(),
            query,
            createdAt: new Date().toISOString(),
            accentColor: getRandomAccentColor(),
          };
          currentSearches.unshift(newSearch);
          localStorage.setItem('savedSearches', JSON.stringify(currentSearches));
        }
      }

      setIsLoading(false);
      setTimeout(() => setShowCheck(true), 300);
    }, 2000);

    return () => clearTimeout(loaderTimer);
  }, [query, isAlreadyScheduled]);

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.iconContainer}>
            <div className="spinner" style={styles.loadingSpinner}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#82fed6" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <h1 style={styles.loadingTitle}>Scheduling cron job...</h1>
          <p style={styles.loadingSubtitle}>{query}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <div style={{
            ...styles.iconCircle,
            transform: showCheck ? 'scale(1)' : 'scale(0.8)',
            opacity: showCheck ? 1 : 0,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#82fed6" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h1 style={styles.title}>Cron Job Scheduled</h1>

        <div style={styles.queryContainer}>
          <span style={styles.queryLabel}>Search query</span>
          <p style={styles.queryText}>{query}</p>
        </div>

        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>Runs every 24 hours</span>
          </div>
          <div style={styles.infoRow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span>New prospects will be added automatically</span>
          </div>
          <div style={styles.infoRow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span>You'll be notified when results are ready</span>
          </div>
        </div>

        <button className="scheduled-back-btn" onClick={() => navigate('/')} style={styles.backButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    width: '100%',
    background: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '500px',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(130, 254, 214, 0.1)',
    border: '2px solid rgba(130, 254, 214, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  title: {
    fontSize: '32px',
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: '24px',
    letterSpacing: '-0.5px',
  },
  queryContainer: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '32px',
    width: '100%',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  queryLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: '8px',
    display: 'block',
  },
  queryText: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#FFFFFF',
    lineHeight: 1.5,
    margin: 0,
  },
  infoBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '40px',
    width: '100%',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '14px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 24px',
    borderRadius: '100px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loadingSpinner: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: '24px',
    fontWeight: 500,
    color: '#FFFFFF',
    marginBottom: '12px',
    letterSpacing: '-0.3px',
  },
  loadingSubtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    maxWidth: '400px',
    lineHeight: 1.5,
    margin: 0,
  },
};

export default ScheduledPage;
