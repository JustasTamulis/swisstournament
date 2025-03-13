import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Add trophy icon
import LooksOneIcon from '@mui/icons-material/LooksOne';  // First place icon
import LooksTwoIcon from '@mui/icons-material/LooksTwo';  // Second place icon
import { useSearchParams } from 'react-router-dom';
import { getAllTeams, getTeamByIdentifier, getTournamentResults } from '../../services/tournamentService';
import { useTournament } from '../../context/TournamentContext';

// Enhanced wooden horse SVG component with more detail
const WoodenHorse = ({ color, teamId }) => (
  <svg width="50" height="40" viewBox="0 0 50 40" className={`wooden-horse horse-${teamId % 4}`}>
    {/* Horse body */}
    <path 
      d="M10,20 C8,16 10,10 13,8 C15,7 18,8 20,7 C22,6 24,2 27,2 C30,2 32,4 35,6 C38,8 40,10 42,14 C44,18 44,22 42,24 C40,26 36,26 33,25 C30,24 28,22 25,22 C22,22 18,23 16,23 C13,23 12,21 10,20 Z" 
      fill={color}
      stroke="#5D4037"
      strokeWidth="1.5"
    />
    {/* Mane */}
    <path 
      d="M26,6 C28,5 30,3 32,6 C33,8 31,9 29,9 C27,9 24,8 26,6 Z" 
      fill="#3E2723" 
      stroke="#3E2723" 
    />
    {/* Eye */}
    <circle cx="37" cy="12" r="1" fill="#3E2723" />
    {/* Legs */}
    <path d="M15,23 L13,32" stroke="#5D4037" strokeWidth="2" />
    <path d="M20,23 L20,32" stroke="#5D4037" strokeWidth="2" />
    <path d="M30,23 L32,32" stroke="#5D4037" strokeWidth="2" />
    <path d="M36,22 L38,32" stroke="#5D4037" strokeWidth="2" />
    {/* Tail */}
    <path 
      d="M10,20 C8,22 6,23 7,20 C8,17 9,18 10,20 Z" 
      fill="#3E2723" 
      stroke="#3E2723"
    />
    {/* Stick */}
    <rect x="24" y="32" width="3" height="8" fill="#8D6E63" />
    {/* Wood grain on horse */}
    <path 
      d="M20,10 C25,11 30,12 35,11" 
      fill="none" 
      stroke="#5D4037" 
      strokeWidth="0.5" 
      opacity="0.5" 
    />
    <path 
      d="M18,15 C23,16 29,16 34,15" 
      fill="none" 
      stroke="#5D4037" 
      strokeWidth="0.5" 
      opacity="0.5" 
    />
  </svg>
);

// Optional: load wooden horse SVG component
// const WoodenHorse = ({ teamId }) => (
//     <img 
//       src={`/images/wooden-horse-${teamId % 4}.png`} 
//       alt="Wooden horse" 
//       className={`wooden-horse horse-${teamId % 4}`}
//       style={{ height: '40px', width: 'auto' }} 
//     />
//   );

const TrackPage = () => {
    const [searchParams] = useSearchParams();
    const [teams, setTeams] = useState([]);
    const [playerTeam, setPlayerTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [animating, setAnimating] = useState(false);
    const prevTeamsRef = useRef([]);
    const animationTimeout = useRef(null);
    const stepAnimationRef = useRef(null);
    const lastViewedStatesRef = useRef({});
    const [winners, setWinners] = useState({ first: null, second: null });
    
    // Get tournament context
    const { roundInfo, roundChanged, finishDistance } = useTournament();
    
    // Get the player_id from URL params
    const playerId = searchParams.get('player_id');

    // Track if we've done the initial load
    const initialLoadDone = useRef(false);

    // Extract round stage for conditional rendering
    const roundStage = roundInfo?.stage;

    useEffect(() => {
        // Add swinging animation styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            @keyframes swingHorse0 {
                0%, 100% { transform: rotate(-3deg); }
                50% { transform: rotate(3deg); }
            }
            @keyframes swingHorse1 {
                0%, 100% { transform: rotate(-5deg); }
                50% { transform: rotate(2deg); }
            }
            @keyframes swingHorse2 {
                0%, 100% { transform: rotate(-2deg); }
                50% { transform: rotate(5deg); }
            }
            @keyframes swingHorse3 {
                0%, 100% { transform: rotate(-4deg); }
                50% { transform: rotate(4deg); }
            }
            .wooden-horse {
                transform-origin: 25px 36px;
            }
            .horse-0 {
                animation: swingHorse0 1.5s ease-in-out infinite;
            }
            .horse-1 {
                animation: swingHorse1 1.7s ease-in-out infinite;
            }
            .horse-2 {
                animation: swingHorse2 1.9s ease-in-out infinite;
            }
            .horse-3 {
                animation: swingHorse3 1.6s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
        
        return () => document.head.removeChild(style);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                
                // Fetch all teams
                const teamsData = await getAllTeams();
                
                // Sort teams by distance (descending)
                const sortedTeams = teamsData.sort((a, b) => b.distance - a.distance);
                
                // Check if this is the first load or data has changed since last viewed
                const isFirstLoad = prevTeamsRef.current.length === 0;
                const hasDataChanged = JSON.stringify(prevTeamsRef.current.map(t => t.distance)) !== 
                    JSON.stringify(sortedTeams.map(t => t.distance));
                
                // If we need to animate (data changed)
                if (hasDataChanged && !isFirstLoad) {
                    // Start step-by-step animation
                    animateStepByStep(prevTeamsRef.current, sortedTeams);
                } else {
                    // No animation needed, just update
                    setTeams(sortedTeams);
                }
                
                // Store current teams for next comparison
                prevTeamsRef.current = sortedTeams;
                
                // If player_id is provided, find the player's team
                if (playerId) {
                    const playerTeamData = await getTeamByIdentifier(playerId);
                    if (playerTeamData) {
                        setPlayerTeam(playerTeamData);
                    }
                }
            } catch (err) {
                console.error("Error fetching track data:", err);
                setError('Failed to load track data. Please try again.');
            } finally {
                setLoading(false);
                initialLoadDone.current = true;
            }
        };
        
        // Function to animate horses in steps
        const animateStepByStep = (prevTeams, newTeams) => {
            setAnimating(true);
            
            // Start with previous positions
            setTeams([...prevTeams]);
            
            // Create intermediate states - one step at a time
            const steps = 10;
            let currentStep = 0;
            
            // Clear any existing animation
            if (stepAnimationRef.current) {
                clearInterval(stepAnimationRef.current);
            }
            
            stepAnimationRef.current = setInterval(() => {
                currentStep++;
                
                if (currentStep < steps) {
                    // Calculate intermediate positions
                    const intermediateTeams = prevTeams.map((team, index) => {
                        const newTeam = newTeams.find(t => t.id === team.id);
                        const targetDistance = newTeam ? newTeam.distance : team.distance;
                        const stepDistance = team.distance + ((targetDistance - team.distance) / steps) * currentStep;
                        
                        return {
                            ...team,
                            distance: stepDistance
                        };
                    });
                    
                    setTeams(intermediateTeams);
                } else {
                    // Final step - set to actual new positions
                    setTeams(newTeams);
                    setAnimating(false);
                    clearInterval(stepAnimationRef.current);
                }
            }, 100); // Each step takes 100ms
        };
        
        // Only fetch data on the initial load or when round changes
        if (!initialLoadDone.current || roundChanged) {
            fetchData();
        }
        
        return () => {
            if (animationTimeout.current) {
                clearTimeout(animationTimeout.current);
            }
            if (stepAnimationRef.current) {
                clearInterval(stepAnimationRef.current);
            }
        };
    }, [playerId, roundChanged]);

    useEffect(() => {
        // Check if we're in finished stage and fetch winners
        if (roundStage === 'finished') {
            const fetchWinners = async () => {
                try {
                    const results = await getTournamentResults();
                    if (results && results.active) {
                        setWinners({
                            first: results.first_place.id,
                            second: results.second_place?.id
                        });
                    }
                } catch (err) {
                    console.error("Error fetching tournament results:", err);
                }
            };
            
            fetchWinners();
        }
    }, [roundStage]);

    // Generate team colors based on team id for consistency
    const getTeamColor = (teamId) => {
        // More natural wooden colors
        const colors = ['#C19A6B', '#B85C38', '#A0522D', '#CD853F', '#D2B48C', '#8B4513', '#DEB887', '#F5DEB3'];
        return colors[teamId % colors.length];
    };

    if (loading && teams.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Box className="TopBar" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DirectionsRunIcon />
                <Typography sx={{marginLeft: '15px', fontWeight: 'bold'}} variant='h6'>
                    Carnival Horse Race
                </Typography>
                
                {/* Show tournament status indicator */}
                {roundStage === 'finished' && (
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', px: 2, py: 0.5, borderRadius: 1 }}>
                        <EmojiEventsIcon sx={{ color: 'white' }} />
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                            Tournament Completed!
                        </Typography>
                    </Box>
                )}
                
                {roundStage === 'final' && (
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'secondary.main', px: 2, py: 0.5, borderRadius: 1 }}>
                        <EmojiEventsIcon sx={{ color: 'white' }} />
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                            Final Tiebreaker!
                        </Typography>
                    </Box>
                )}
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* Enhanced wooden race board */}
            <Paper 
                elevation={5} 
                sx={{ 
                    p: 3, 
                    backgroundColor: '#8D6E63',
                    backgroundImage: `
                        linear-gradient(90deg, rgba(121,85,72,0.3) 0%, rgba(141,110,99,0.1) 20%, rgba(121,85,72,0.3) 40%, rgba(141,110,99,0.1) 60%, rgba(121,85,72,0.3) 80%, rgba(141,110,99,0.1) 100%),
                        radial-gradient(circle at 20% 30%, rgba(62,39,35,0.4) 0%, rgba(62,39,35,0) 5%),
                        radial-gradient(circle at 60% 70%, rgba(62,39,35,0.4) 0%, rgba(62,39,35,0) 5%),
                        radial-gradient(circle at 80% 10%, rgba(62,39,35,0.3) 0%, rgba(62,39,35,0) 5%),
                        radial-gradient(circle at 10% 80%, rgba(62,39,35,0.3) 0%, rgba(62,39,35,0) 5%),
                        linear-gradient(180deg, rgba(62,39,35,0.1) 0%, rgba(141,110,99,0.1) 2%, rgba(141,110,99,0.1) 98%, rgba(62,39,35,0.1) 100%)
                    `,
                    border: '12px solid',
                    borderColor: '#5D4037',
                    borderImage: 'linear-gradient(45deg, #3E2723 0%, #5D4037 20%, #8D6E63 50%, #5D4037 80%, #3E2723 100%) 1',
                    borderRadius: '15px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 0 80px rgba(0,0,0,0.1)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E"),
                            repeating-linear-gradient(90deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 5px, rgba(0,0,0,0.02) 5px, rgba(0,0,0,0.02) 10px)
                        `,
                        opacity: 0.4,
                        zIndex: 0,
                    }
                }}
            >
                {/* Finishing line */}
                <Box sx={{ 
                    position: 'absolute',
                    right: '15px',
                    top: 0,
                    bottom: 0,
                    width: '5px',
                    backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 5px, #fff 5px, #fff 10px)',
                    zIndex: 1,
                    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
                    '&::after': {
                        content: '"FINISH"',
                        position: 'absolute',
                        top: '5px',
                        right: '10px',
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px black',
                        transform: 'rotate(90deg)',
                    }
                }} />
                
                {/* Starting line */}
                <Box sx={{ 
                    position: 'absolute',
                    left: '20px',
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 5px, #fff 5px, #fff 10px)',
                    zIndex: 1,
                    opacity: 0.6,
                    '&::before': {
                        content: '"START"',
                        position: 'absolute',
                        top: '5px',
                        left: '10px',
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px black',
                        transform: 'rotate(90deg)',
                        fontSize: '0.8rem'
                    }
                }} />
                
                {/* Wood knots - random pattern */}
                {[...Array(5)].map((_, i) => (
                    <Box 
                        key={`knot-${i}`}
                        sx={{ 
                            position: 'absolute',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(62,39,35,0.8) 0%, rgba(121,85,72,0.4) 40%, rgba(141,110,99,0) 70%)',
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                            transform: 'rotate(45deg)',
                            opacity: 0.7,
                            zIndex: 0
                        }} 
                    />
                ))}
                
                {/* Track lanes */}
                {teams.map((team, index) => (
                    <Box key={team.id} sx={{ 
                        mb: index === teams.length - 1 ? 0 : 3,
                        position: 'relative',
                        height: '50px',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderTop: '3px solid #3E2723',
                        borderBottom: '3px solid #3E2723',
                        boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.1)',
                        zIndex: 2,
                    }}>
                        {/* Lane label with winner indicators */}
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                position: 'absolute',
                                left: '10px',
                                top: '-8px',
                                fontWeight: playerTeam?.id === team.id ? 'bold' : 'normal',
                                color: 'white',
                                textShadow: '1px 1px 2px black, 0 0 5px rgba(0,0,0,0.5)',
                                zIndex: 3,
                                fontSize: '0.9rem',
                                background: 'rgba(0,0,0,0.2)',
                                padding: '0 5px',
                                borderRadius: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            {team.name} {playerTeam?.id === team.id && '(You)'}
                            
                            {/* First place trophy */}
                            {winners.first === team.id && (
                                <LooksOneIcon 
                                    sx={{ 
                                        color: 'gold',
                                        filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                                        fontSize: '1.2rem'
                                    }} 
                                />
                            )}
                            
                            {/* Second place trophy */}
                            {winners.second === team.id && (
                                <LooksTwoIcon 
                                    sx={{ 
                                        color: 'silver',
                                        filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                                        fontSize: '1.2rem'
                                    }} 
                                />
                            )}
                        </Typography>
                        
                        {/* Slot for horse movement */}
                        <Box sx={{ 
                            position: 'absolute',
                            left: 0,
                            top: '60%',
                            width: '100%',
                            height: '5px',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                            borderRadius: '2px',
                            zIndex: 2,
                        }} />
                        
                        {/* Distance markers */}
                        {[1, 2, 3, 4].map((marker) => (
                            <Box 
                                key={`marker-${team.id}-${marker}`} 
                                sx={{
                                    position: 'absolute',
                                    left: `${(marker / 5) * 100}%`,
                                    top: '30%',
                                    height: '10px',
                                    width: '1px',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    zIndex: 1,
                                }}
                            />
                        ))}
                        
                        {/* Wooden horse with swinging animation */}
                        <Box sx={{ 
                            position: 'absolute',
                            left: `${(team.distance / finishDistance) * 100}%`,
                            top: '50%',
                            transform: 'translate(-50%, -80%)',
                            transition: animating ? 'left 0.3s ease-out' : 'none',
                            transformOrigin: 'bottom center',
                            zIndex: 3,
                        }}>
                            <WoodenHorse color={getTeamColor(team.id)} teamId={team.id} />
                        </Box>
                        
                        {/* Distance indicators */}
                        <Typography variant="caption" sx={{ 
                            position: 'absolute',
                            right: '10px',
                            bottom: '-20px',
                            color: 'white',
                            textShadow: '1px 1px 1px black',
                            zIndex: 3,
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            {Math.floor(team.distance)}/{finishDistance}
                        </Typography>
                    </Box>
                ))}
                
                <Typography variant="caption" display="block" sx={{ 
                    mt: 4,
                    textAlign: 'center',
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    padding: '5px',
                    borderRadius: '5px'
                }}>
                    {roundStage === 'finished' ? (
                        'Tournament completed! Congratulations to the winners!'
                    ) : (
                        `First team to reach ${finishDistance} points wins the tournament!`
                    )}
                </Typography>
            </Paper>
        </Box>
    );
};

export default TrackPage;
