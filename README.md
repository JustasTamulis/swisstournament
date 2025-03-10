# Tournament App

A real-time competitive tournament application that facilitates multi-stage competition between teams.

## Overview

This application manages a tournament where teams compete through a series of rounds, each consisting of three stages: betting, jousting, and bonus selection. Teams progress along a race track, and the first to reach 12 points wins.

## Architecture

The application is built with a Django REST Framework backend and React frontend.

### Backend

- **Data Models**: Teams, rounds, games, bets, odds, and bonuses
- **Tournament Logic**: Round progression, game pairing, bet processing, and bonus application
- **API Endpoints**: RESTful services for all tournament actions and data access

### Frontend

#### Helper Files

- **tournamentService.js**: Handles all API communication with the backend, providing methods for fetching tournament data and submitting player actions. Includes functions for retrieving teams, rounds, games, placing bets, marking game results, and applying bonuses.

- **TournamentContext.jsx**: A React context that maintains shared state across components. It:
  - Centralizes round information fetching to avoid duplicate requests
  - Tracks the current page being viewed
  - Provides the `useTournament` hook for accessing shared state
  - Implements efficient polling by only fetching round info globally

- **TopNav.jsx**: The navigation component that:
  - Renders the app's main navigation bar
  - Highlights the current page and tournament stage
  - Preserves URL parameters when navigating
  - Displays the current round and stage information
  - Utilizes the TournamentContext for real-time updates

#### Pages

- **TrackPage.jsx**: Visualizes the race track with all teams' progress
  - Shows teams sorted by distance with the player's team highlighted
  - Animates position changes when teams advance
  - Only polls for updates when actively viewed

- **BetPage.jsx**: Manages the betting stage functionality
  - Displays all teams with their odds and the player's current bets
  - Shows available bets and enables betting actions during betting stage
  - Confirms bet placement with dialog prompts
  - Updates in real-time when bets are placed

- **JoustPage.jsx**: Handles the jousting match functionality
  - Shows upcoming opponents during joust stage
  - Provides UI for recording match results (win/lose)
  - Adapts to the current tournament stage
  - Displays appropriate messages when matches are completed

- **BonusPage.jsx**: Manages bonus selection and application
  - Shows available bonus options during bonus stage
  - Provides a visual interface for selecting bonuses
  - Confirms bonus selection with dialogs
  - Displays bonus status and history

- **AboutPage.jsx**: Provides tournament information and rules
  - Static content explaining tournament mechanics
  - Rule explanations and guidelines for players

## Tournament Flow

1. **Betting Stage**: Teams place bets on who they think will win matches
2. **Joust Stage**: Teams are paired for matches, and results are recorded
3. **Bonus Stage**: Teams select special bonuses that provide advantages
4. **Progression**: After each complete round, teams advance on the track
5. **Victory**: First team to reach 12 points wins the tournament

## Optimizations

- Selective polling: Each page only makes API calls when actively viewed
- Shared context: Common data like round info is fetched once and shared
- Real-time updates: UI components reflect the current tournament state
- Responsive design: Mobile-optimized interface with context-aware navigation

## Usage

Players access the app with a team identifier as a URL parameter (`player_id`), which associates them with their team. The navigation adapts to the current tournament stage, highlighting the relevant actions and information.