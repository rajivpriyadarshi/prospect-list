import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Thread {
  id: number;
  title: string;
  prospects: number;
  newToday: number;
  accentColor: string;
  iconBg: string;
  icon: string;
}

interface SavedSearch {
  id: number;
  query: string;
  createdAt: string;
  accentColor: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [hoveredSearchId, setHoveredSearchId] = useState<number | null>(null);
  const [hoveredThreadId, setHoveredThreadId] = useState<number | null>(null);
  const [deletedThreads, setDeletedThreads] = useState<number[]>([]);

  // Check if prospects have been loaded
  const prospectsLoaded = sessionStorage.getItem('prospectsLoaded') === 'true';
  const prospectsCount = sessionStorage.getItem('prospectsCount');

  // Load saved searches and deleted threads from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
    const deleted = localStorage.getItem('deletedThreads');
    if (deleted) {
      setDeletedThreads(JSON.parse(deleted));
    }
  }, []);

  const handleDeleteSearch = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const handleDeleteThread = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = [...deletedThreads, id];
    setDeletedThreads(updated);
    localStorage.setItem('deletedThreads', JSON.stringify(updated));
  };

  const threads: Thread[] = [
    {
      id: 1,
      title: 'Indian late-stage private companies with IPO, DRHP, pre-IPO, secondary sale, reverse flip, bankers appointed, listing prep, or liquidity event signals',
      prospects: 0,
      newToday: 0,
      accentColor: '#9c6ccd',
      iconBg: 'rgba(156,108,205,0.08)',
      icon: '/icon-purple.svg'
    },
    {
      id: 2,
      title: 'Tech founder in Singapore',
      prospects: 0,
      newToday: 0,
      accentColor: '#7bd5ff',
      iconBg: 'rgba(123,213,255,0.08)',
      icon: '/icon-cyan.svg'
    },
    {
      id: 3,
      title: 'Crypto millionaire in SEA',
      prospects: 0,
      newToday: 0,
      accentColor: '#f8ff7b',
      iconBg: 'rgba(248,255,123,0.08)',
      icon: '/icon-yellow.svg'
    },
  ];

  const suggestions = [
    {
      label: 'GLOBAL IPO',
      text: 'Global private companies with near-term IPO or liquidity signals and key executives'
    },
    {
      label: 'SEA STARTUPS',
      text: 'Southeast Asian startups with IPO, dual listing, or liquidity signals'
    },
    {
      label: 'M&A TARGETS',
      text: 'Companies likely to be acquired based on consolidation or strategic interest'
    }
  ];


  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/scheduled?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (text: string) => {
    navigate(`/scheduled?q=${encodeURIComponent(text)}`);
  };

  const handleThreadClick = () => {
    navigate('/prospects');
  };

  const handleSavedSearchClick = (query: string) => {
    navigate(`/scheduled?q=${encodeURIComponent(query)}`);
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={{
        ...styles.sidebar,
        width: sidebarCollapsed ? '0px' : '420px',
        minWidth: sidebarCollapsed ? '0px' : '420px',
        padding: sidebarCollapsed ? '0' : '20px 12px',
        overflow: sidebarCollapsed ? 'hidden' : 'visible',
      }}>
        {/* Starfield animation in sidebar */}
        <div className="stars-container">
          <div id="stars"></div>
          <div id="stars2"></div>
          <div id="stars3"></div>
        </div>

        {/* Logo */}
        <div className="animate-fade-in" style={styles.logoContainer}>
          <img src="/zinc-logo.png" alt="Zinc" style={styles.logoImage} />
          <span style={styles.logoText}>Zinc</span>
        </div>

        {/* Thread Items */}
        <div style={styles.threadList}>
          {threads.filter(t => !deletedThreads.includes(t.id)).map((thread, index) => (
            <button
              key={thread.id}
              className={`thread-item animate-slide-in-left delay-${(index + 1) * 100}`}
              style={styles.threadItem}
              onClick={thread.id === 1 ? handleThreadClick : () => handleSavedSearchClick(thread.title)}
              onMouseEnter={() => setHoveredThreadId(thread.id)}
              onMouseLeave={() => setHoveredThreadId(null)}
            >
              <div style={{
                ...styles.threadIconContainer,
                background: thread.iconBg,
              }}>
                <img src={thread.icon} alt="" style={styles.threadIcon} />
              </div>
              <div style={styles.threadInfo}>
                <span style={styles.threadTitle}>{thread.title}</span>
                <div style={styles.threadMeta}>
                  {thread.id === 1 && prospectsLoaded && prospectsCount ? (
                    <span style={styles.threadProspects}>{prospectsCount} prospects</span>
                  ) : thread.id === 1 ? (
                    <span style={{ ...styles.threadProspects, color: thread.accentColor }}>
                      Awaiting prospects
                    </span>
                  ) : (
                    <span style={{ ...styles.threadProspects, color: 'rgba(255, 255, 255, 0.4)' }}>
                      Scheduled
                    </span>
                  )}
                </div>
              </div>
              {hoveredThreadId === thread.id && thread.id !== 1 && (
                <button
                  onClick={(e) => handleDeleteThread(e, thread.id)}
                  style={styles.deleteButton}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </button>
          ))}

          {/* Saved Searches */}
          {savedSearches.map((search, index) => (
            <button
              key={search.id}
              className={`thread-item animate-slide-in-left delay-${(index + 4) * 100}`}
              style={styles.threadItem}
              onClick={() => handleSavedSearchClick(search.query)}
              onMouseEnter={() => setHoveredSearchId(search.id)}
              onMouseLeave={() => setHoveredSearchId(null)}
            >
              <div style={{
                ...styles.threadIconContainer,
                background: `${search.accentColor}15`,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={search.accentColor} strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </div>
              <div style={styles.threadInfo}>
                <span style={styles.threadTitle}>{search.query}</span>
                <div style={styles.threadMeta}>
                  <span style={{ ...styles.threadProspects, color: 'rgba(255, 255, 255, 0.4)' }}>
                    Scheduled
                  </span>
                </div>
              </div>
              {hoveredSearchId === search.id && (
                <button
                  onClick={(e) => handleDeleteSearch(e, search.id)}
                  style={styles.deleteButton}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </button>
          ))}
        </div>

        {/* Collapse Button */}
        <button
          className="collapse-btn"
          onClick={() => setSidebarCollapsed(true)}
          style={styles.collapseButton}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>
          </svg>
        </button>
      </div>

      {/* Expand Button (when collapsed) */}
      {sidebarCollapsed && (
        <button
          className="collapse-btn"
          onClick={() => setSidebarCollapsed(false)}
          style={styles.expandButton}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 7l5 5-5 5M6 7l5 5-5 5"/>
          </svg>
        </button>
      )}

      {/* Main Content */}
      <div style={{
        ...styles.mainContent,
        marginLeft: sidebarCollapsed ? '0' : '420px',
      }}>
        <div style={styles.gradientOverlay} />
        <div style={styles.stripesOverlay} />

        {/* Starfield animation */}
        <div className="stars-container" style={styles.starsContainer}>
          <div id="stars"></div>
          <div id="stars2"></div>
          <div id="stars3"></div>
        </div>

        <div style={styles.content}>
          <h1 className="animate-fade-in-up delay-200" style={styles.title}>Find your next prospect</h1>

          <div className="search-container animate-fade-in-up delay-300" style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search for your next prospect"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={styles.searchInput}
            />
            <button className="search-btn" onClick={handleSearch} style={styles.searchButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <div style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={`suggestion-card animate-scale-in delay-${(index + 4) * 100}`}
                onClick={() => handleSuggestionClick(suggestion.text)}
                style={styles.suggestionCard}
              >
                <span style={styles.suggestionLabel}>{suggestion.label}</span>
                <span style={styles.suggestionText}>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    background: '#000000',
  },
  sidebar: {
    width: '420px',
    minWidth: '420px',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.9)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 4px',
  },
  logoImage: {
    width: '28px',
    height: '28px',
    objectFit: 'contain',
  },
  logoText: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  threadList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  threadItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '24px 16px',
    borderRadius: '24px',
    background: '#111111',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.15s',
  },
  threadIconContainer: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  threadIcon: {
    width: '16px',
    height: '16px',
  },
  threadInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflow: 'hidden',
    flex: 1,
  },
  threadTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.3,
    letterSpacing: '-0.32px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  threadMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    letterSpacing: '-0.24px',
  },
  threadProspects: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 400,
  },
  threadDot: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  threadNew: {
    fontWeight: 500,
  },
  mainContent: {
    flex: 1,
    marginLeft: '420px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: '#000000',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: '-40px',
    left: 0,
    right: 0,
    top: 0,
    backgroundImage: 'url("/gradient-bg.svg")',
    backgroundSize: 'cover',
    backgroundPosition: 'bottom right',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
  },
  stripesOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundImage: `repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 12px,
      rgba(0,0,0,0.15) 12px,
      rgba(0,0,0,0.15) 24px
    )`,
    backgroundSize: '24px 100%',
    mixBlendMode: 'overlay' as const,
    pointerEvents: 'none',
    opacity: 0.6,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.5,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '40px 20px',
  },
  title: {
    fontSize: '64px',
    fontWeight: 500,
    color: '#FFFFFF',
    marginBottom: '40px',
    textAlign: 'center',
    letterSpacing: '-3px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '100px',
    padding: '8px 8px 8px 24px',
    width: '100%',
    maxWidth: '580px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '40px',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '15px',
    padding: '12px 0',
    outline: 'none',
  },
  searchButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#FFFFFF',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    flexShrink: 0,
  },
  suggestionsContainer: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '900px',
  },
  suggestionCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '32px',
    padding: '20px 24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    textAlign: 'left',
    maxWidth: '260px',
    minWidth: '220px',
    transition: 'background 0.2s, border-color 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  suggestionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  suggestionText: {
    fontSize: '12px',
    fontWeight: 400,
    color: '#FFFFFF',
    lineHeight: 1.5,
  },
  collapseButton: {
    position: 'absolute',
    bottom: '20px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  expandButton: {
    position: 'fixed',
    top: '20px',
    left: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 20,
  },
  deleteButton: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
};

export default HomePage;
