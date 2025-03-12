import { Routes, Route } from 'react-router'
import './App.css'

import TopNav from './components/navbar/TopNav'
import JoustPage from './components/pages/JoustPage'
import BetPage from './components/pages/BetPage'
import TrackPage from './components/pages/TrackPage'
import BonusPage from './components/pages/BonusPage'
import AboutPage from './components/pages/AboutPage'
import DashboardPage from './components/pages/DashboardPage'

// Tournament Context
import { TournamentProvider } from './context/TournamentContext';
function App() {
  return (
    <TournamentProvider>
      <TopNav
        content={
          <Routes>
            {/* Default route redirects to track */}
            <Route path="/" element={<TrackPage />} />
            <Route path="track" element={<TrackPage />} />
            <Route path="bet" element={<BetPage />} />
            <Route path="joust" element={<JoustPage />} />
            <Route path="bonus" element={<BonusPage />} />
            <Route path="about" element={<AboutPage />} />
            {/* Secret dashboard route */}
            <Route path="secret/dashboard" element={<DashboardPage />} />
          </Routes>
        }
      />
    </TournamentProvider>
  )
}

export default App
