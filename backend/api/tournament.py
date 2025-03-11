import random
from .models import Round, Team, Game, Odds, Bet, Bonus

# Betting stage

def generate_new_odds(round_id):
    """Generate new odds for the given round. Currently all odds = 1.0"""
    round_obj = Round.objects.get(id=round_id)
    teams = Team.objects.all()
    
    # For simplicity, set all odds to 1.0 for all teams
    for team in teams:
        Odds.objects.create(
            round=round_obj,
            team=team,
            odd1=1.0,
            odd2=1.0
        )
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
            if bet.finished:
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
    generate_new_game_pairs(new_round.id)
    
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
    """Check if there's a winner (distance > 12)"""
    winner = Team.objects.filter(distance__gt=12).first()
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
