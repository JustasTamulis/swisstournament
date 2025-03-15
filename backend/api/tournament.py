import random
from .models import Round, Team, Game, Odds, Bet, Bonus
import logging
from django.conf import settings
from django.db import models

# Get a logger for this file
logger = logging.getLogger(__name__)


# locations
LOCATIONS = [
    "Biblioteka",
    "Stalas",
    "Sofa",
    "Lova"
]

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
    
    # If all teams are at the same distance, assign default odds
    if max_distance == min_distance:
        default_odd1 = 2
        default_odd2 = 1
        return [(default_odd1, default_odd2) if i < len(distances) - 1 else (0, 0) 
                for i in range(len(distances))]
    
    # Range of distances between teams
    distance_range = max_distance - min_distance
    
    for distance in distances:
        # Check if this team is the leader (closest to finish)
        if distance == max_distance and len(distances) > 1:
            # Leading team gets odds of 0
            results.append((0, 0))
            continue
        
        # Calculate relative position (0 = furthest behind, 1 = closest to leader)
        relative_position = (distance - min_distance) / distance_range
        
        # Gap factor: teams further from leader get higher odds
        # Non-linear relationship to accentuate differences
        position_factor = 1 - relative_position  # 0 = closest to leader, 1 = furthest back
        
        # Base multiplier depends only on relative position
        # Using a cubic function for more dramatic differences
        base_multiplier = 3.0 + (position_factor ** 2) * 28.0
        
        # Calculate odds
        odd1 = max(0, base_multiplier)
        
        # odd2 is always lower than odd1 but still proportional
        odd2 = max(0, odd1 * 0.7)
        
        # Round to nearest integer
        odd1 = round(odd1)
        odd2 = round(odd2)
        
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
    
    
    # Set current round as inactive
    current_round.active = False
    current_round.save()

    # Generate game pairs only for the first round
    if current_round.number == 1:
        
        # Create new round with joust stage
        new_round = Round.objects.create(
            number=current_round.number,
            active=True,
            stage="joust"
        )

        games = generate_new_game_pairs_first_round(new_round.id)
        logger.info("Generated %d initial game pairs for round 1", len(games))
    else:
        # Get the next joust round and set it as active
        new_round = Round.objects.get(number=current_round.number, stage="joust")
        new_round.active = True
        new_round.save()
    
    logger.info("Moving to joust stage for round %s", new_round.number)
    return new_round

# Joust stage

def generate_new_game_pairs_first_round(round_id):
    """Generate game pairs for the first round with random locations"""
    round_obj = Round.objects.get(id=round_id)
    teams = list(Team.objects.all())
    
    # Determine how many locations to use based on team count
    team_count = len(teams)
    location_count = min(len(LOCATIONS), max(2, team_count // 2))
    active_locations = LOCATIONS[:location_count]
    
    random.shuffle(teams)
    games=[]
    for i in range(0, len(teams), 2):
        location = active_locations[i // 2]
        game = Game.objects.create(
        team1=teams[i],
        team2=teams[i + 1],
        round=round_obj,
        location=location,
        finished=False
    )
    games.append(game)

    return games

def generate_new_game_pairs(round_id):
    """Generate game pairs for the given round based on team locations"""
    round_obj = Round.objects.get(id=round_id)
    teams = list(Team.objects.all())
    
    # Determine how many locations to use based on team count
    team_count = len(teams)
    location_count = min(len(LOCATIONS), max(2, team_count // 2))
    active_locations = LOCATIONS[:location_count]
    
    # Check for location preferences from bonuses
    team_preferences = {}
    team_locations = {}
    misplaced_teams = []
    
    # Get the previous bonus round for this round number - 1
    try:
        prev_round_number = round_obj.number - 1
        prev_bonus_rounds = Round.objects.filter(number=prev_round_number, stage="bonus")
        
        if prev_bonus_rounds.exists():
            prev_bonus_round = prev_bonus_rounds.first()
            
            # Get location selections from bonuses
            location_bonuses = Bonus.objects.filter(
                round=prev_bonus_round,
                bonus_type='select_location',
                finished=True
            )
            
            # Create a mapping of locations to the teams that selected them
            location_selections = {}
            for bonus in location_bonuses:
                location = bonus.bonus_target
                if location in active_locations:  # Only consider active locations
                    if location not in location_selections:
                        location_selections[location] = []
                    location_selections[location].append(bonus.team)
                    team_preferences[bonus.team.id] = location
            
            logger.info(f"Found location preferences: {location_selections}")
            
            # Assign teams to their preferred locations (max 2 teams per location)
            for location, location_teams in location_selections.items():
                for idx, team in enumerate(location_teams):
                    if idx < 2:  # Only consider the first 2 teams for each location
                        if location not in team_locations:
                            team_locations[location] = []
                        team_locations[location].append(team)
    except Exception as e:
        logger.error(f"Error processing location preferences: {e}")
    
    # Process remaining teams based on previous game results
    remaining_teams = [team for team in teams if team.id not in team_preferences]
    # Shuffle the remaining teams to avoid bias
    random.shuffle(remaining_teams)
    
    # Determine location for teams with no preference based on previous game results
    for team in remaining_teams:
        # Find the team's most recent game
        prev_games = Game.objects.filter(
            models.Q(team1=team) | models.Q(team2=team),
            round__number=round_obj.number - 1
        ).order_by('-created')
        
        if prev_games.exists():
            prev_game = prev_games.first()
            prev_location = prev_game.location
            prev_location_index = active_locations.index(prev_location)
            
            # Team won if it was team1 and win is True, or team2 and win is False
            won = (team == prev_game.team1 and prev_game.win) or (team == prev_game.team2 and not prev_game.win)
            
            if won:
                # Move up one location if won, unless already at top
                new_location_index = min(prev_location_index + 1, location_count - 1)
            else:
                # Move down one location if lost, unless already at bottom
                new_location_index = max(prev_location_index - 1, 0)
            
            location = active_locations[new_location_index]
        else:
            # Raise an error if we can't determine location based on previous games
            logger.error(f"Couldn't determine location for team {team.name} based on previous games")
            raise Exception("Couldn't determine location for all teams")
        
        # Check if we can add this team to the location (max 2 teams per location)
        if location not in team_locations:
            team_locations[location] = [team]
        elif len(team_locations[location]) < 2:
            team_locations[location].append(team)
        else:
            # This location is full, add to misplaced teams
            misplaced_teams.append(team)
    
    # Handle misplaced teams - assign them to locations with fewer than 2 teams
    for team in misplaced_teams:
        for location in active_locations:
            if location not in team_locations:
                team_locations[location] = [team]
                break
            elif len(team_locations[location]) < 2:
                team_locations[location].append(team)
                break
    
    # Create games for each location
    games = []
    
    for location, location_teams in team_locations.items():
        # Only create games for locations with exactly 2 teams
        if len(location_teams) == 2:
            game = Game.objects.create(
                team1=location_teams[0],
                team2=location_teams[1],
                round=round_obj,
                location=location,
                finished=False
            )
            games.append(game)
            logger.info(f"Created game at {location} between {location_teams[0].name} and {location_teams[1].name}")
        else:
            logger.error(f"Location {location} has {len(location_teams)} teams")
            raise Exception("Invalid number of teams per location")
    
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
        if team in winners and team.distance % 3 == 0:
            Bonus.objects.create(
                team=team,
                round=new_round,
                finished=False,
                description="Bonus for stepping every 3 distance"
            )
            logger.info(f"Team {team.name} got a bonus for stepping every 3 distance")
        else:
            # Check if the team has lost 3 times in a row in the LOCATIONS[0]
            prev_games = Game.objects.filter(
                models.Q(team1=team) | models.Q(team2=team)
            ).order_by('-created')
            loser_3_times = False
            if prev_games.count() >= 3:
                loses_in_row = 0
                for i in range(3):
                    if prev_games[i].location == LOCATIONS[0] and prev_games[i].win is False:
                        loses_in_row += 1
                    else:
                        break

                if loses_in_row > 0 and loses_in_row % 3 == 0:
                    loser_3_times = True

            if loser_3_times:
                Bonus.objects.create(
                    team=team,
                    round=new_round,
                    finished=False,
                    description="Compensation bonus for losing 3 times in a row"
                )
                logger.info(f"Team {team.name} got a bonus for losing 3 times in a row")
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
    
    # Generate game pairs for the new round
    new_joust_round = Round.objects.create(
        number=new_round.number,
        active=False,
        stage="joust"
    )
    games = generate_new_game_pairs(new_joust_round.id)
    logger.info("Generated %d game pairs for round %s", len(games), new_round.number)
    
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

def move_to_final_multiple_ties_stage(round_id, first_place, second_place_ties):
    """Create a special final round for resolving multiple ties for second place"""
    current_round = Round.objects.get(id=round_id)
    
    # Create new round with special final-multiple-ties stage
    new_round = Round.objects.create(
        number=current_round.number,
        active=True,
        stage="final-multiple-ties"
    )
    
    # Set current round as inactive
    current_round.active = False
    current_round.save()
    
    # Log the first place winner and the ties for second place
    logger.info(f"Moving to final-multiple-ties stage with {first_place.name} as first place.")
    logger.info(f"Second place ties: {', '.join([team.name for team in second_place_ties])}")
    
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
