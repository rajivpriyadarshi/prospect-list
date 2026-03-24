import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Prospect } from '../types';

// Check for page refresh ONCE at module load time (before React mounts)
const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
const wasPageRefreshed = navEntries.length > 0 && navEntries[0].type === 'reload';
if (wasPageRefreshed) {
  sessionStorage.removeItem('prospectsLoaded');
}

interface Thread {
  id: number;
  title: string;
  prospects: number;
  newToday: number;
  accentColor: string;
  iconBg: string;
  icon: string;
}

interface ThinkingStep {
  type: 'browsing' | 'thinking';
  title: string;
  reasoning?: string;
  sources?: { name: string; url: string }[];
}

const thinkingSteps: ThinkingStep[] = [
  {
    type: 'browsing',
    title: 'Searching for Indian AI and fintech startup founders',
    sources: [
      { name: 'Sarvam AI', url: 'sarvam.ai/about-us' },
      { name: 'Krutrim', url: 'krutrim.com' },
      { name: 'Yellow.ai', url: 'yellow.ai/webinar/redefine-customer-experience-with-ai' },
      { name: 'Observe.AI', url: 'observe.ai/resources/playbook-handling-call-surges-like-a-pro' },
      { name: 'YourStory', url: 'yourstory.com/2025/07/inside-indias-ai-boom-startups' },
      { name: 'Inc42', url: 'inc42.com/startups/indian-ai-startup-tracker/' },
    ]
  },
  {
    type: 'thinking',
    title: 'Gathering founder and company info',
    reasoning: "I need to gather details about company founders and relevant liquidity signals. I'll cross-reference funding data from Tracxn with IPO filings. For secondary sale signals, I should check Business Standard and ET BFSI for recent announcements."
  },
  {
    type: 'browsing',
    title: 'Fetching funding rounds and IPO filings',
    sources: [
      { name: 'Tracxn', url: 'tracxn.com/report-releases/india-fintech-h1-2025' },
      { name: 'IPO Central', url: 'ipocentral.in/fintech-platform-yubi-group' },
      { name: 'Business Standard', url: 'business-standard.com/finance/personal-finance' },
      { name: 'The CEO', url: 'theceo.in/leaders/madhusudan-e' },
      { name: 'Fibe', url: 'fibe.in/founders/' },
      { name: 'ET BFSI', url: 'bfsi.economictimes.indiatimes.com/articles' },
      { name: 'Fintech News SG', url: 'fintechnews.sg/108940/fintech-india' },
    ]
  },
  {
    type: 'thinking',
    title: 'Analyzing liquidity signals',
    reasoning: "Looking at the data, I can see several companies with strong IPO signals - DRHP filings, banker appointments, and pre-IPO rounds. I'll prioritize founders from companies showing multiple liquidity indicators for higher confidence tiers."
  },
  {
    type: 'browsing',
    title: 'Searching for company founders and leadership teams',
    sources: [
      { name: 'Lendingkart', url: 'lendingkart.com/team/' },
      { name: 'Jai Kisan', url: 'jaikisan.io/about' },
      { name: 'TICE News', url: 'tice.news/tice-trending/indias-most-funded' },
      { name: 'Alter Global', url: 'alter.vc/portfolio/entrepreneurs' },
      { name: 'CredFlow', url: 'credflow.in/about/' },
      { name: 'smallcase', url: 'smallcase.com/about' },
      { name: 'INDmoney', url: 'indmoney.com/blog/author/ashish-kashyap' },
    ]
  },
  {
    type: 'browsing',
    title: 'Extracting wealth management founder profiles',
    sources: [
      { name: 'Dezerv', url: 'dezerv.in/team/' },
      { name: 'Stable Money', url: 'stablemoney.in/about-us' },
      { name: 'Scripbox', url: 'scripbox.com/pages/the-scripbox-team' },
      { name: 'AssetPlus', url: 'partners.assetplus.in/aboutus' },
      { name: 'PrivateCircle', url: 'blog.privatecircle.co/from-trading-floors' },
      { name: 'CRED', url: 'cred.club/about' },
    ]
  },
  {
    type: 'thinking',
    title: 'Cross-referencing with news sources',
    reasoning: "Now I need to verify the liquidity signals against recent news. Economic Times and NDTV Profit often break stories about upcoming IPOs and secondary sales. I'll also check Bain's VC report for market context on valuations."
  },
  {
    type: 'browsing',
    title: 'Verifying signals from financial news sources',
    sources: [
      { name: 'Economic Times', url: 'economictimes.indiatimes.com/tech/technology' },
      { name: 'Bain India VC Report', url: 'bain.com/insights/india-venture-capital-report-2025' },
      { name: 'Times of India', url: 'timesofindia.indiatimes.com/business/india-business' },
      { name: 'NDTV Profit', url: 'ndtvprofit.com/markets/insurancedekho-owner' },
      { name: 'Financial Express', url: 'financialexpress.com/market/ipo-news-niyo' },
      { name: 'ION Analytics', url: 'ionanalytics.com/insights/mergermarket/whatfix' },
    ]
  },
];

const ProspectsPage = () => {
  const navigate = useNavigate();

  // Check if we've already fetched data this session (refresh check done at module level)
  const hasLoadedBefore = useRef(sessionStorage.getItem('prospectsLoaded') === 'true').current;

  const [allProspects, setAllProspects] = useState<Prospect[]>([]);
  const [visibleProspects, setVisibleProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedThreadId] = useState<number>(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(hasLoadedBefore ? thinkingSteps.length : 0);
  const [completedSteps, setCompletedSteps] = useState<ThinkingStep[]>(hasLoadedBefore ? thinkingSteps : []);
  const [skipAnimation] = useState(hasLoadedBefore);
  const [stepsComplete, setStepsComplete] = useState(hasLoadedBefore);
  const [typedReasoning, setTypedReasoning] = useState('');
  const isThinking = !skipAnimation && currentStepIndex < thinkingSteps.length;

  const threads: Thread[] = [
    {
      id: 1,
      title: 'Indian late-stage private companies with IPO, DRHP, pre-IPO, secondary sale, reverse flip, bankers appointed, listing prep, or liquidity event signals',
      prospects: 24,
      newToday: 1,
      accentColor: '#9c6ccd',
      iconBg: 'rgba(156,108,205,0.08)',
      icon: '/icon-purple.svg'
    },
    {
      id: 2,
      title: 'Tech founder in Singapore',
      prospects: 8,
      newToday: 2,
      accentColor: '#7bd5ff',
      iconBg: 'rgba(123,213,255,0.08)',
      icon: '/icon-cyan.svg'
    },
    {
      id: 3,
      title: 'Tech founder in Singapore',
      prospects: 45,
      newToday: 8,
      accentColor: '#82fed6',
      iconBg: 'rgba(130,254,214,0.08)',
      icon: '/icon-teal.svg'
    },
    {
      id: 4,
      title: 'Crypto millionaire in SEA',
      prospects: 12,
      newToday: 4,
      accentColor: '#f8ff7b',
      iconBg: 'rgba(248,255,123,0.08)',
      icon: '/icon-yellow.svg'
    },
  ];

  useEffect(() => {
    fetch('/prospect_data.json')
      .then(res => res.json())
      .then((data: Prospect[]) => {
        // Filter out prospects without LinkedIn links
        const prospectsWithLinkedIn = data.filter(p => p.LinkedIn && p.LinkedIn.trim() !== '');
        setAllProspects(prospectsWithLinkedIn);
        setIsLoading(false);
        // If skipping animation, show all data immediately
        if (skipAnimation) {
          setVisibleProspects(prospectsWithLinkedIn);
        }
      })
      .catch(err => console.error('Error loading prospects:', err));
  }, [skipAnimation]);

  // Thinking animation - step through each thinking step
  useEffect(() => {
    if (skipAnimation) return;

    // Reset state (handles StrictMode double-invoke)
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setTypedReasoning('');

    let stepIndex = 0;
    let charIndex = 0;
    let typingInterval: ReturnType<typeof setInterval> | null = null;

    const processStep = () => {
      if (stepIndex >= thinkingSteps.length) {
        setStepsComplete(true);
        return;
      }

      const currentStep = thinkingSteps[stepIndex];
      setCurrentStepIndex(stepIndex);

      if (currentStep.type === 'thinking' && currentStep.reasoning) {
        // Typewriter effect for reasoning
        charIndex = 0;
        setTypedReasoning('');

        typingInterval = setInterval(() => {
          if (charIndex < currentStep.reasoning!.length) {
            setTypedReasoning(currentStep.reasoning!.slice(0, charIndex + 1));
            charIndex++;
          } else {
            if (typingInterval) clearInterval(typingInterval);
            // Move to completed and next step
            setTimeout(() => {
              setCompletedSteps(prev => [...prev, currentStep]);
              setTypedReasoning('');
              stepIndex++;
              processStep();
            }, 300);
          }
        }, 12);
      } else {
        // Browsing step - show for a moment then move on
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, currentStep]);
          stepIndex++;
          processStep();
        }, 900);
      }
    };

    // Start processing
    const startTimeout = setTimeout(processStep, 300);

    return () => {
      clearTimeout(startTimeout);
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [isThinking]);

  // Stream prospects one by one with staggered delays
  useEffect(() => {
    if (allProspects.length === 0 || isLoading || skipAnimation) return;

    setVisibleProspects([]); // Reset when data changes

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Initial delay before starting to populate
    const initialDelay = 800;

    // Adjust timing based on list size for smoother experience
    const delayPerItem = allProspects.length > 50 ? 200 : 250;

    allProspects.forEach((prospect, index) => {
      // Delays between each row
      const baseDelay = initialDelay + 300;
      const randomVariation = Math.random() * 150;
      const cumulativeDelay = baseDelay + randomVariation + (index * delayPerItem);

      const timeout = setTimeout(() => {
        setVisibleProspects(prev => [...prev, prospect]);
      }, cumulativeDelay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [allProspects, isLoading, skipAnimation]);

  // Thinking is truly complete when steps are done AND list is fully loaded
  const listFullyLoaded = allProspects.length > 0 && visibleProspects.length >= allProspects.length;
  const thinkingComplete = stepsComplete && listFullyLoaded;

  // Still show as thinking if steps done but list not loaded (but not if skipping animation)
  const showAsThinking = !skipAnimation && (stepsComplete ? !listFullyLoaded : true);

  // Save to sessionStorage when fully loaded
  useEffect(() => {
    if (thinkingComplete && !skipAnimation) {
      sessionStorage.setItem('prospectsLoaded', 'true');
      sessionStorage.setItem('prospectsCount', String(allProspects.length));
    }
  }, [thinkingComplete, skipAnimation, allProspects.length]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
      '#10B981', '#14B8A6', '#3B82F6', '#6366F1', '#A855F7'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
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
        {/* Header with logo and back button */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logoContainer}>
            <img src="/zinc-logo.png" alt="Zinc" style={styles.logoImage} />
            <span style={styles.logoText}>Zinc</span>
          </div>
          <button className="back-btn" onClick={() => navigate('/')} style={styles.backButton}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to home
          </button>
        </div>

        {/* Starfield background - covers entire sidebar */}
        <div className="stars-container">
          <div id="stars"></div>
          <div id="stars2"></div>
          <div id="stars3"></div>
        </div>

        {/* ChatGPT-style Thinking Animation */}
        <div className="sidebar-content" style={styles.thinkingView}>
          {/* Thinking header */}
          <div style={styles.thinkingHeader}>
            <span style={styles.thinkingTitle}>Fetching information</span>
            {showAsThinking && (
              <div className="thinking-dots" style={styles.thinkingDotsContainer}>
                <span style={styles.thinkingDot} />
                <span style={styles.thinkingDot} />
                <span style={styles.thinkingDot} />
              </div>
            )}
          </div>

          {/* Progress bar */}
          {showAsThinking && (
            <div style={styles.progressBarContainer}>
              <div
                style={{
                  ...styles.progressBarFill,
                  width: stepsComplete
                    ? `${(visibleProspects.length / allProspects.length) * 100}%`
                    : `${((currentStepIndex + 1) / thinkingSteps.length) * 100}%`,
                }}
              />
            </div>
          )}

          {/* Steps list */}
          <div className="thinking-steps-list" style={styles.stepsList}>
            {/* Completed steps */}
            {completedSteps.map((step, index) => (
              <div key={index} className="step-item" style={styles.stepItem}>
                <div style={styles.stepIconColumn}>
                  <div style={styles.stepIconWrapper}>
                    {step.type === 'browsing' ? (
                      <span style={styles.globeIcon}>🌐</span>
                    ) : (
                      <span style={styles.bulletIcon}>•</span>
                    )}
                  </div>
                  {/* Connecting line - show if not last completed step OR if there's a current step */}
                  {(index < completedSteps.length - 1 || showAsThinking) && (
                    <div className="connecting-line" style={styles.connectingLine} />
                  )}
                </div>
                <div style={styles.stepContent}>
                  <span style={styles.stepTitle}>{step.title}</span>
                  {step.type === 'browsing' && step.sources && (
                    <div style={styles.sourcePills}>
                      {step.sources.slice(0, 5).map((source, sIdx) => (
                        <span key={sIdx} style={styles.sourcePill}>
                          <span style={styles.sourcePillIcon}>🌐</span>
                          {source.url}
                        </span>
                      ))}
                      {step.sources.length > 5 && (
                        <span style={styles.morePill}>+{step.sources.length - 5} more</span>
                      )}
                    </div>
                  )}
                  {step.type === 'thinking' && step.reasoning && (
                    <p style={styles.reasoningText}>{step.reasoning}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Current step being processed */}
            {isThinking && currentStepIndex < thinkingSteps.length && (
              <div className="step-item current" style={{ ...styles.stepItem, opacity: 1 }}>
                <div style={styles.stepIconColumn}>
                  <div style={styles.stepIconWrapper}>
                    {thinkingSteps[currentStepIndex].type === 'browsing' ? (
                      <span style={styles.globeIcon}>🌐</span>
                    ) : (
                      <span style={styles.bulletIcon}>•</span>
                    )}
                  </div>
                </div>
                <div style={styles.stepContent}>
                  <span className="shimmer-text" style={styles.stepTitle}>{thinkingSteps[currentStepIndex].title}</span>
                  {thinkingSteps[currentStepIndex].type === 'browsing' && thinkingSteps[currentStepIndex].sources && (
                    <div style={styles.sourcePills}>
                      {thinkingSteps[currentStepIndex].sources!.slice(0, 5).map((source, sIdx) => (
                        <span key={sIdx} style={styles.sourcePill}>
                          <span style={styles.sourcePillIcon}>🌐</span>
                          {source.url}
                        </span>
                      ))}
                      {thinkingSteps[currentStepIndex].sources!.length > 5 && (
                        <span style={styles.morePill}>+{thinkingSteps[currentStepIndex].sources!.length - 5} more</span>
                      )}
                    </div>
                  )}
                  {thinkingSteps[currentStepIndex].type === 'thinking' && typedReasoning && (
                    <p style={styles.reasoningText}>
                      {typedReasoning}
                      <span className="cursor-blink" style={styles.cursor}>|</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Show loading step when steps done but list still loading */}
            {stepsComplete && !listFullyLoaded && (
              <div className="step-item current" style={{ ...styles.stepItem, opacity: 1 }}>
                <div style={styles.stepIconColumn}>
                  <div style={styles.stepIconWrapper}>
                    <span style={styles.bulletIcon}>•</span>
                  </div>
                </div>
                <div style={styles.stepContent}>
                  <span className="shimmer-text" style={styles.stepTitle}>
                    Loading prospects ({visibleProspects.length}/{allProspects.length})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Completion message */}
          {thinkingComplete && (
            <div style={styles.completeMessage}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Found {visibleProspects.length} prospects</span>
            </div>
          )}
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

        {/* Page Header */}
        {(() => {
          const selectedThread = threads.find(t => t.id === selectedThreadId) || threads[0];
          const isStillLoading = visibleProspects.length < allProspects.length;
          return (
            <div className={isStillLoading ? 'header-shimmer' : ''} style={styles.pageHeader}>
              <div className="header-icon-circle" style={{
                ...styles.headerIconCircle,
                background: selectedThread.iconBg,
              }}>
                <img src={selectedThread.icon} alt="" style={{ width: '24px', height: '24px' }} />
              </div>
              <div style={styles.headerText}>
                <h1
                  className={visibleProspects.length < allProspects.length ? 'title-shimmer' : ''}
                  style={styles.pageTitle}
                >
                  {selectedThread.title}
                </h1>
                <div style={styles.headerMeta}>
                  <span
                    className={visibleProspects.length < allProspects.length ? 'title-shimmer' : ''}
                    style={styles.headerProspects}
                  >
                    {visibleProspects.length} prospects
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Table */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '338px' }}>PERSON</th>
                <th style={{ ...styles.th, width: '260px' }}>COMPANY</th>
                <th style={{ ...styles.th, width: '208px' }}>SECTOR</th>
                <th style={{ ...styles.th, width: '208px' }}>NET-WORTH</th>
                <th style={{ ...styles.th, width: '494px' }}>REASONING</th>
                <th style={{ ...styles.th, width: '546px' }}>LIQUIDITY SIGNAL</th>
                <th style={{ ...styles.th, width: '156px' }}>LINKEDIN</th>
              </tr>
            </thead>
            <tbody>
              {visibleProspects.map((prospect, index) => (
                <tr key={index} className="prospect-row row-animate" style={styles.row}>
                  <td style={styles.td}>
                    <div style={styles.prospectCell}>
                      <div
                        style={{
                          ...styles.avatar,
                          background: getAvatarColor(prospect.Person),
                        }}
                      >
                        {getInitials(prospect.Person)}
                      </div>
                      <div style={styles.personInfo}>
                        <span style={styles.prospectName}>{prospect.Person}</span>
                        <span style={styles.designation}>{prospect.Designation}</span>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.company}>{prospect.Company}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.sector}>{prospect.Sector}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.netWorth}>{prospect.NetWorth || '—'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.reasoning}>{prospect.Reasoning || '—'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.liquiditySignal}>{prospect['Liquidity Signal']}</span>
                  </td>
                  <td style={styles.td}>
                    {prospect.LinkedIn && (
                      <button
                        className="linkedin-btn"
                        onClick={() => window.open(prospect.LinkedIn, '_blank')}
                        style={styles.linkedinButton}
                      >
                        View LinkedIn
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {/* Shimmer skeleton rows */}
              {visibleProspects.length < allProspects.length && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <tr key={`shimmer-${i}`} className="shimmer-row" style={styles.row}>
                      <td style={styles.td}>
                        <div style={styles.prospectCell}>
                          <div className="shimmer" style={styles.shimmerAvatar} />
                          <div style={styles.personInfo}>
                            <div className="shimmer" style={styles.shimmerName} />
                            <div className="shimmer" style={styles.shimmerDesignation} />
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div className="shimmer" style={styles.shimmerText} />
                      </td>
                      <td style={styles.td}>
                        <div className="shimmer" style={styles.shimmerText} />
                      </td>
                      <td style={styles.td}>
                        <div className="shimmer" style={styles.shimmerNetWorth} />
                      </td>
                      <td style={styles.td}>
                        <div className="shimmer" style={styles.shimmerReasoning} />
                      </td>
                      <td style={styles.td}>
                        <div className="shimmer" style={styles.shimmerSignal} />
                      </td>
                      <td style={styles.td}>
                        <div className="shimmer" style={styles.shimmerButton} />
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>

          {/* Loading indicator */}
          {visibleProspects.length < allProspects.length && (
            <div style={styles.loadingIndicator}>
              <div style={styles.loadingDots}>
                <span style={styles.loadingDot} className="dot-1" />
                <span style={styles.loadingDot} className="dot-2" />
                <span style={styles.loadingDot} className="dot-3" />
              </div>
              <span style={styles.loadingText}>Fetching prospects from sources...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f0f0f',
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
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoImage: {
    width: '28px',
    height: '28px',
    objectFit: 'contain' as const,
  },
  logoText: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '6px 12px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '12px',
    cursor: 'pointer',
  },
  mainContent: {
    flex: 1,
    marginLeft: '420px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    minHeight: '100vh',
    background: '#0f0f0f',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '16px',
    padding: '35px 24px 33px',
    background: 'rgba(24, 24, 24, 0.6)',
    position: 'relative',
    zIndex: 1,
  },
  headerIconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(156, 108, 205, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
    lineHeight: 1.3,
    letterSpacing: '-0.48px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    letterSpacing: '-0.24px',
  },
  headerProspects: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  headerDot: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  headerNew: {
    fontWeight: 500,
  },
  tableWrapper: {
    flex: 1,
    overflowX: 'auto',
    overflowY: 'auto',
    padding: '0 32px 32px',
    position: 'relative',
    zIndex: 1,
  },
  table: {
    width: '100%',
    minWidth: '1100px',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '16px 12px',
    fontSize: '10px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.2px',
    textTransform: 'uppercase',
    fontFamily: '"Reddit Mono", monospace',
    position: 'sticky',
    top: 0,
    background: '#0f0f0f',
  },
  row: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  td: {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#FFFFFF',
    verticalAlign: 'middle',
  },
  prospectCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  personInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  prospectName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    letterSpacing: '-0.28px',
  },
  company: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.4,
  },
  sector: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.4,
  },
  netWorth: {
    fontSize: '13px',
    color: 'rgba(130, 254, 214, 0.9)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  tierBars: {
    display: 'flex',
    gap: '3px',
  },
  tierBar: {
    width: '4px',
    height: '14px',
    borderRadius: '2px',
  },
  designation: {
    fontSize: '12px',
    fontWeight: 300,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '-0.24px',
  },
  liquiditySignal: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.4,
  },
  reasoning: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
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
  linkedinButton: {
    background: 'rgba(10, 102, 194, 0.1)',
    border: '1px solid rgba(10, 102, 194, 0.2)',
    borderRadius: '8px',
    padding: '6px 12px',
    color: '#0A66C2',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    transition: 'all 0.2s ease',
  },
  loadingIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px',
  },
  loadingDots: {
    display: 'flex',
    gap: '4px',
  },
  loadingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.4)',
  },
  loadingText: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  shimmerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  shimmerName: {
    width: '120px',
    height: '14px',
    borderRadius: '4px',
  },
  shimmerDesignation: {
    width: '80px',
    height: '12px',
    borderRadius: '4px',
  },
  shimmerText: {
    width: '100px',
    height: '14px',
    borderRadius: '4px',
  },
  shimmerBars: {
    width: '40px',
    height: '14px',
    borderRadius: '4px',
  },
  shimmerSignal: {
    width: '200px',
    height: '14px',
    borderRadius: '4px',
  },
  shimmerNetWorth: {
    width: '120px',
    height: '14px',
    borderRadius: '4px',
  },
  shimmerReasoning: {
    width: '200px',
    height: '14px',
    borderRadius: '4px',
  },
  shimmerButton: {
    width: '90px',
    height: '28px',
    borderRadius: '6px',
  },
  thinkingView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  thinkingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 0 8px',
    position: 'relative',
    zIndex: 1,
  },
  thinkingTitle: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '-0.12px',
  },
  thinkingDotsContainer: {
    display: 'flex',
    gap: '2px',
    marginLeft: '2px',
  },
  thinkingDot: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.3)',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    flex: 1,
    overflowY: 'auto',
    paddingRight: '4px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    position: 'relative',
    zIndex: 1,
  } as React.CSSProperties,
  stepItem: {
    display: 'flex',
    gap: '8px',
    opacity: 0.7,
    transition: 'opacity 0.3s ease',
  },
  stepIconColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '16px',
    flexShrink: 0,
  },
  stepIconWrapper: {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  connectingLine: {
    width: '1px',
    flex: 1,
    minHeight: '8px',
    background: 'rgba(255, 255, 255, 0.15)',
    marginTop: '4px',
  },
  globeIcon: {
    fontSize: '11px',
    lineHeight: 1,
  },
  bulletIcon: {
    fontSize: '14px',
    lineHeight: 1,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: 0,
    paddingBottom: '32px',
  },
  stepTitle: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 1.4,
  },
  sourcePills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  sourcePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '3px 8px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.6)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  },
  sourcePillIcon: {
    fontSize: '9px',
  },
  morePill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  reasoningText: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 1.5,
    margin: 0,
    letterSpacing: '-0.12px',
  },
  cursor: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 300,
    marginLeft: '1px',
  },
  completeMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: 'rgba(74, 222, 128, 0.06)',
    borderRadius: '8px',
    border: '1px solid rgba(74, 222, 128, 0.1)',
    fontSize: '10px',
    color: '#4ADE80',
    fontWeight: 500,
    marginTop: '8px',
  },
  progressBarContainer: {
    height: '2px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '1px',
    overflow: 'hidden',
    marginBottom: '12px',
    position: 'relative',
    zIndex: 1,
  },
  progressBarFill: {
    height: '100%',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '1px',
    transition: 'width 0.4s ease',
  },
};

export default ProspectsPage;
