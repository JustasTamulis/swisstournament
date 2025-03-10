import { useState } from 'react'
import { Routes, Route } from 'react-router'
import './App.css'

// Old components
import Home from './components_old/Home'
import Create from './components_old/Create'
import Edit from './components_old/Edit'
import Delete from './components_old/Delete'
import Navbar from './components_old/navbar/Navbar'

// New components
import TopNav from './components/navbar/TopNav'
import JoustPage from './components/pages/JoustPage'
import BetPage from './components/pages/BetPage'
import TrackPage from './components/pages/TrackPage'
import BonusPage from './components/pages/BonusPage'
import AboutPage from './components/pages/AboutPage'

function App() {
  return (
    <>
      <Routes>
        {/* New tournament routes - added wildcard matcher (/*) to parent route */}
        <Route path="/*" element={
          <TopNav
            content={
              <Routes>
                {/* Default route redirects to track now */}
                <Route path="" element={<TrackPage />} />
                <Route path="track" element={<TrackPage />} />
                <Route path="bet" element={<BetPage />} />
                <Route path="joust" element={<JoustPage />} />
                <Route path="bonus" element={<BonusPage />} />
                <Route path="about" element={<AboutPage />} />
              </Routes>
            }
          />
        } />

        {/* Old routes moved to /old/* */}
        <Route path="/old/*" element={
          <Navbar
            content={
              <Routes>
                <Route path="" element={<Home />} />
                <Route path="create" element={<Create />} />
                <Route path="edit/:id" element={<Edit />} />
                <Route path="delete/:id" element={<Delete />} />
              </Routes>
            }
          />
        } />
      </Routes>
    </>
  )
}

export default App
