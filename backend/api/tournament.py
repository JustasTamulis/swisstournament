import random
from .models import Round, Team, Game, Odds, Bet, Bonus
import logging
from django.conf import settings

# Get a logger for this file
logger = logging.getLogger(__name__)

# Betting stage

def new_odds_logic(distances: list[int], finish_distance: int) -> list[tuple]:
    """
    Calculate odds for teams based on their distances from the finish line.
    
    Args:
        distances: List of team distances
        finish_distance: Distance needed to finish the tournament
    
    Returns:
        List of tuples (odd1, odd2) for each team
    """
    # Find max and min distances
    max_distance = max(distances) if distances else 0
    min_distance = min(distances) if distances else 0
    
    results = []
    
    for distance in distances:
        # Calculate normalized position (closer to 1 means closer to finish)
        normalized_position = distance / finish_distance
        
        # Base multiplier - teams further from finish get higher odds
        # Use an inverse relationship
        base_multiplier = 1.5 + (1 - normalized_position) * 3.5
        
        # Adjust based on relative position to other teams
        if max_distance > min_distance:  # Avoid division by zero
            relative_position = (distance - min_distance) / (max_distance - min_distance)
            position_factor = 1 - relative_position  # Lower is better positioned
            
            # Apply position adjustment (0.5 to 1.5 multiplier)
            position_adjustment = 1 + position_factor
        else:
            # All teams at same distance
            position_adjustment = 1.0
            
        # Calculate odds with minimum value of 1.1
        odd1 = max(1.1, base_multiplier * position_adjustment)
        
        # odd2 is always lower than odd1 but still proportional
        odd2 = max(1.05, odd1 * 0.7)  # 70% of odd1, minimum 1.05
        
        # Round to 2 decimal places
        odd1 = round(odd1, 2)
        odd2 = round(odd2, 2)
        
        results.append((odd1, odd2))
    
    return results

def generate_new_odds(round_id):
    """Generate new odds for the given round based on team distances."""
    round_obj = Round.objects.get(id=round_id)
    teams = Team.objects.all()
    
    # Get finish distance from settings
    finish_distance = settings.TOURNAMENT_FINISH_DISTANCE
    
    # Get all team distances
    team_distances = [team.distance for team in teams]
    
    # Calculate odds using the logic function
    odds_results = new_odds_logic(team_distances, finish_distance)
    
    # Create the odds objects in the database
    for team, (odd1, odd2) in zip(teams, odds_results):
        Odds.objects.create(
            round=round_obj,
            team=team,
            odd1=odd1,
            odd2=odd2
        )
        
        logger.debug(f"Team {team.name}: distance={team.distance}, odds={odd1}/{odd2}")
    
    return True

def all_bets_placed(round_id):
    """Check if all teams have placed bets for this round"""
    round_obj = Round.objects.get(id=round_id)
    teams = Team.objects.all()

    # For each team, check if they have atleast one bet with bet_finished=True
    for team in teams:
        bets = Bet.objects.filter(team=team, round=round_obj)
        
        bet_finished = False
        for bet in bets:
            if bet.bet_finish:
                bet_finished = True
                break
        if not bet_finished:
            return False
    return True


def move_to_joust_stage(round_id):
    """Move from betting stage to joust stage"""
    current_round = Round.objects.get(id=round_id)
    
    # Create new round with joust stage
    new_round = Round.objects.create(
        number=current_round.number,
        active=True,
        stage="joust"
    )
    
    # Set current round as inactive
    current_round.active = False
    current_round.save()
    
    # Generate game pairs for the new round
    games = generate_new_game_pairs(new_round.id)
    logger.info("Generated %d game pairs for round %s", len(games), new_round.number)
    
    return new_round

# Joust stage

def generate_new_game_pairs(round_id):
    """Generate random game pairs for the given round"""
    round_obj = Round.objects.get(id=round_id)
    teams = list(Team.objects.all())
    random.shuffle(teams)
    
    # Pair teams randomly
    games = []
    for i in range(0, len(teams), 2):
        if i + 1 < len(teams):
            game = Game.objects.create(
                team1=teams[i],
                team2=teams[i+1],
                round=round_obj,
                finished=False
            )
            games.append(game)
    
    return games

def all_games_finished(round_id):
    """Check if all games in the round are finished"""
    round_obj = Round.objects.get(id=round_id)
    games = Game.objects.filter(round=round_obj)
    for game in games:
        if not game.finished:
            return False
    return True

def move_track(team_id, distance=1):
    """Update team's distance based on win"""
    team = Team.objects.get(id=team_id)
    team.distance += distance
    team.save()
    return team.distance

def process_winners(round_id):
    """Process all winners of the round's games, increasing their distance"""
    round_obj = Round.objects.get(id=round_id)
    games = Game.objects.filter(round=round_obj)
    
    winners = []
    for game in games:
        winner_team = game.team1 if game.win else game.team2
        move_track(winner_team.id)
        winners.append(winner_team)
    
    return winners

def move_to_bonus_stage(round_id, winners):
    """Move from joust stage to bonus stage"""
    current_round = Round.objects.get(id=round_id)
    
    # Create new round with bonus stage
    new_round = Round.objects.create(
        number=current_round.number,
        active=True,
        stage="bonus"
    )
    
    # Set current round as inactive
    current_round.active = False
    current_round.save()
    
    # Create bonuses for all teams
    # Set bonus as finished for not winning teams
    # Winning teams will get bonus every 3 distance
    teams = Team.objects.all()
    for team in teams:
        # For debuging, always give bonus to the first team
        if team == teams[0]:
            Bonus.objects.create(
                team=team,
                round=new_round,
                finished=False,
                description="Bonus for winning the round"
            )
        elif team in winners and team.distance % 3 == 0:
            Bonus.objects.create(
                team=team,
                round=new_round,
                finished=False,
                description="Bonus for winning the round"
            )
        else:
            Bonus.objects.create(
                team=team,
                round=new_round,
                finished=True,
                description="No bonus this round"
            )
    
    return new_round

# Bonus stage

def all_bonuses_used(round_id):
    """Check if all teams have used their bonuses for this round"""
    round_obj = Round.objects.get(id=round_id)
    bonuses = Bonus.objects.filter(round=round_obj)
    for bonus in bonuses:
        if not bonus.finished:
            return False
    return True

def move_to_new_round(round_id):
    """Start a new round with betting stage after bonus stage"""
    current_round = Round.objects.get(id=round_id)
    teams = list(Team.objects.all())

    # Increase the number of bets_available for all teams
    for team in teams:
        team.bets_available += 1
        team.save()
    
    # Create new round with betting stage
    new_round = Round.objects.create(
        number=current_round.number + 1,
        active=True,
        stage="betting"
    )
    
    # Set current round as inactive
    current_round.active = False
    current_round.save()
    
    # Generate odds for the new round
    generate_new_odds(new_round.id)
    
    return new_round

# Finished stage

def check_tournament_winner():
    """Check if there's a winner (distance > setting value)"""
    finish_distance = settings.TOURNAMENT_FINISH_DISTANCE
    winner = Team.objects.filter(distance__gt=finish_distance).first()
    if winner:
        return winner
    return None

def move_to_finished_stage(round_id, winner):
    """Create a final round marking the tournament as finished"""
    current_round = Round.objects.get(id=round_id)
    
    # Create new round with finished stage
    new_round = Round.objects.create(
        number=current_round.number,
        active=True,
        stage="finished"
    )
    
    # Set current round as inactive
    current_round.active = False
    current_round.save()
    
    return new_round
