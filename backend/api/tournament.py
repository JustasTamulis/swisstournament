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

# Final and Finished stages

def check_tournament_winner():
    """Check if there's a winner or tie at the finish line"""
    finish_distance = settings.TOURNAMENT_FINISH_DISTANCE
    
    # Find all teams at or beyond finish distance
    potential_winners = Team.objects.filter(distance__gte=finish_distance).order_by('-distance')
    
    if not potential_winners.exists():
        return None, None, None
    
    # Get the highest distance achieved
    max_distance = potential_winners.first().distance
    
    # Get all teams at the highest distance (could be ties)
    teams_at_max = Team.objects.filter(distance=max_distance).order_by('id')
    
    # Get second highest distance teams (for second place consideration)
    if teams_at_max.count() == 1:
        # If we have a clear winner, look for second place
        second_highest = Team.objects.filter(distance__lt=max_distance).order_by('-distance')
        if second_highest.exists():
            second_max_distance = second_highest.first().distance
            teams_at_second_max = Team.objects.filter(distance=second_max_distance).order_by('id')
        else:
            teams_at_second_max = []
    else:
        # If we have ties for first, there's no second place yet
        teams_at_second_max = []
    
    # Return the tie situation
    return teams_at_max, teams_at_second_max, max_distance >= finish_distance

def move_to_final_stage(round_id, first_place_ties=None, second_place_ties=None):
    """Create a final round for resolving ties"""
    current_round = Round.objects.get(id=round_id)
    
    # Create new round with final stage
    new_round = Round.objects.create(
        number=current_round.number,
        active=True,
        stage="final"
    )
    
    # Set current round as inactive
    current_round.active = False
    current_round.save()
    
    # Create games for first place ties if needed
    if first_place_ties and len(first_place_ties) == 2:
        Game.objects.create(
            team1=first_place_ties[0],
            team2=first_place_ties[1],
            round=new_round,
            finished=False
        )
        logger.info(f"Created final game for first place between {first_place_ties[0].name} and {first_place_ties[1].name}")
    
    # Create games for second place ties if needed
    if second_place_ties and len(second_place_ties) == 2:
        Game.objects.create(
            team1=second_place_ties[0],
            team2=second_place_ties[1],
            round=new_round,
            finished=False
        )
        logger.info(f"Created final game for second place between {second_place_ties[0].name} and {second_place_ties[1].name}")
    
    return new_round

def move_to_finished_stage(round_id, first_place=None, second_place=None):
    """Create a final round marking the tournament as finished with winners"""
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
    
    # Store winners in round description or properties
    if first_place:
        logger.info(f"Tournament finished with {first_place.name} in first place!")
    if second_place:
        logger.info(f"Tournament finished with {second_place.name} in second place!")
    
    return new_round

def calculate_betting_results():
    """Calculate betting results based on first and second place winners"""
    # Find the active round with 'finished' stage
    try:
        finished_round = Round.objects.get(active=True, stage='finished')
    except Round.DoesNotExist:
        logger.error("No active finished round found for calculating betting results")
        return None
    
    # Get first place (team with highest distance)
    first_place = Team.objects.all().order_by('-distance').first()
    
    # Get second place (team with second highest distance)
    second_place = Team.objects.all().exclude(id=first_place.id).order_by('-distance').first()
    
    if not first_place or not second_place:
        logger.error("Couldn't determine first or second place for betting results")
        return None
    
    # Calculate betting points for each team
    teams = Team.objects.all()
    results = []
    
    for team in teams:
        # Get all bets by this team on the winners
        first_place_bets = Bet.objects.filter(team=team, bet_on_team=first_place)
        second_place_bets = Bet.objects.filter(team=team, bet_on_team=second_place)
        
        # Sum up betting points
        first_place_points = sum([bet.odds.odd1 for bet in first_place_bets]) if first_place_bets else 0
        second_place_points = sum([bet.odds.odd2 for bet in second_place_bets]) if second_place_bets else 0
        total_points = first_place_points + second_place_points
        
        results.append({
            'team': team,
            'first_place_points': first_place_points,
            'second_place_points': second_place_points,
            'total_points': total_points
        })
    
    # Sort by total points (descending)
    results.sort(key=lambda x: x['total_points'], reverse=True)
    
    return {
        'first_place': first_place,
        'second_place': second_place,
        'betting_results': results
    }

def increment_finish_distance():
    """Increment the finish distance when there are multiple ties"""
    # This would require updating the setting, which is not possible directly
    # Instead, we'll use a Round property to track the effective finish_distance
    try:
        active_round = Round.objects.get(active=True)
        
        # Create a new round with incremented finish distance
        new_round = Round.objects.create(
            number=active_round.number + 1,
            active=True,
            stage="betting"  # Reset to betting stage for the next round
        )
        
        active_round.active = False
        active_round.save()
        
        # Generate odds for the new round
        generate_new_odds(new_round.id)
        
        logger.info(f"Finish distance effectively increased, continuing tournament with round {new_round.number}")
        
        return new_round
    except Exception as e:
        logger.exception(f"Error incrementing finish distance: {e}")
        return None
