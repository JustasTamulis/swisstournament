import axios from 'axios';

const baseURL = '/api/';

const tournamentApi = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
        accept: "application/json",
    }
});

export const getRoundInfo = async () => {
    try {
        const response = await tournamentApi.get('get-round-info/');
        return response.data;
    } catch (error) {
        console.error("Error fetching round info:", error);
        throw error;
    }
};

export const getNextOpponent = async (identifier, roundId) => {
    try {
        const response = await tournamentApi.get(`get-next-opponent/?identifier=${identifier}&round_id=${roundId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching next opponent:", error);
        throw error;
    }
};

export const placeBet = async (teamId, betOnTeamId, roundId) => {
    try {
        const response = await tournamentApi.post('place-bet/', {
            team_id: teamId,
            bet_on_team_id: betOnTeamId,
            round_id: roundId
        });
        return response.data;
    } catch (error) {
        console.error("Error placing bet:", error);
        throw error;
    }
};

export const markGame = async (teamId, gameId, winnerId, roundId) => {
    try {
        const response = await tournamentApi.post('mark-game/', {
            team_id: teamId,
            game_id: gameId,
            winner_id: winnerId,
            round_id: roundId
        });
        return response.data;
    } catch (error) {
        console.error("Error marking game:", error);
        throw error;
    }
};

export const useBonus = async (bonusData) => {
    try {
        const response = await tournamentApi.post('use-bonus/', bonusData);
        return response.data;
    } catch (error) {
        console.error("Error using bonus:", error);
        throw error;
    }
};

// New functions to support the UI requirements

export const getAllTeams = async () => {
    try {
        const response = await tournamentApi.get('teams/');
        return response.data;
    } catch (error) {
        console.error("Error fetching teams:", error);
        throw error;
    }
};

export const getTeamByIdentifier = async (identifier) => {
    try {
        const response = await tournamentApi.get(`teams/?identifier=${identifier}`);
        return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
        console.error("Error fetching team by identifier:", error);
        throw error;
    }
};

export const getGamesForRound = async (roundId) => {
    try {
        const response = await tournamentApi.get(`games/?round=${roundId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching games for round:", error);
        throw error;
    }
};

export const getBonusForTeam = async (identifier, roundId) => {
    try {
        const response = await tournamentApi.get(`get-bonus-for-team/?identifier=${identifier}&round_id=${roundId}`);
        console.log("Bonus response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching bonus for team:", error);
        throw error;
    }
};

export const getBettingTable = async (identifier, roundId) => {
    try {
        const response = await tournamentApi.get(`get-betting-table/?identifier=${identifier}&round_id=${roundId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching betting table data:", error);
        throw error;
    }
};

export default tournamentApi;
