import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ProspectsPage from './components/ProspectsPage';
import ScheduledPage from './components/ScheduledPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/prospects" element={<ProspectsPage />} />
      <Route path="/scheduled" element={<ScheduledPage />} />
    </Routes>
  );
}

export default App;
