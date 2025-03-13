from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.views.generic import TemplateView
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db import models
from django.conf import settings
import logging

from .models import Team, Round, Game, Bet, Odds, Bonus
from .serializers import (
    TeamSerializer,
    RoundSerializer,
    GameSerializer,
    BetSerializer,
    OddsSerializer,
    BonusSerializer,
)
from .tournament import (
    all_bets_placed,
    move_to_joust_stage,
    check_tournament_winner,
    all_games_finished,
    process_winners,
    move_to_bonus_stage,
    move_to_finished_stage,
    move_to_final_stage,
    calculate_betting_results,
    increment_finish_distance,
    all_bonuses_used,
    move_to_new_round,
    move_to_final_multiple_ties_stage
)

# Get a logger for this file
logger = logging.getLogger(__name__)

# Helper function to check if a round is active
def is_round_active(round_id):
    """Check if a round is active"""
    try:
        round_obj = Round.objects.get(id=round_id, active=True)
        return True
    except Round.DoesNotExist:
        return False

class TeamViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def list(self, request):
        queryset = Team.objects.all()
        
        # Get identifier from query params and filter if provided
        identifier = request.query_params.get('identifier', None)
        if identifier:
            queryset = queryset.filter(identifier=identifier)
            
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
class RoundViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Round.objects.all()
    serializer_class = RoundSerializer

    def list(self, request):
        queryset = Round.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
class GameViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def list(self, request):
        queryset = Game.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
class BetViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Bet.objects.all()
    serializer_class = BetSerializer

    def list(self, request):
        queryset = Bet.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    

class OddsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Odds.objects.all()
    serializer_class = OddsSerializer

    def list(self, request):
        queryset = Odds.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class BonusViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Bonus.objects.all()
    serializer_class = BonusSerializer

    def list(self, request):
        queryset = Bonus.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# React home page
class React(TemplateView):
    template_name = 'index.html'


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_round_info(request):
    """Return the current active round ID and stage"""
    try:
        active_round = Round.objects.get(active=True)
        return Response({
            'round_id': active_round.id,
            'stage': active_round.stage,
            'number': active_round.number
        })
    except Round.DoesNotExist:
        return Response({'error': 'No active round found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_bets_available(request):
    """Return the number of bets available for a team"""
    try:
        identifier = request.query_params.get('identifier')
        if not identifier:
            return Response({'error': 'Team identifier is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        team = get_object_or_404(Team, identifier=identifier)
        return Response({
            'bets_available': team.bets_available
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_next_opponent(request):
    """Return the next opponent team for a given team and round"""
    try:
        identifier = request.query_params.get('identifier')
        round_id = request.query_params.get('round_id')
        
        if not identifier or not round_id:
            return Response({'error': 'Team identifier and round_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        team = get_object_or_404(Team, identifier=identifier)
        round_obj = get_object_or_404(Round, id=round_id)
        
        # Find a game where the team is either team1 or team2
        game = Game.objects.filter(
            (models.Q(team1=team) | models.Q(team2=team)) & 
            models.Q(round=round_obj)
        ).first()
        
        if not game:
            return Response({'error': 'No game found for this team and round'}, status=status.HTTP_404_NOT_FOUND)
        
        # Return the opponent
        opponent = game.team2 if game.team1.id == team.id else game.team1
        
        return Response({
            'opponent_name': opponent.name,
            'opponent_id': opponent.id,
            'opponent_description': opponent.description,
            'game_finished': game.finished,
            'game_id': game.id,
            'location': game.location  # Include location in the response
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_bonus_for_team(request):
    """Return bonus information for a specific team in a specific round"""
    try:
        identifier = request.query_params.get('identifier')
        round_id = request.query_params.get('round_id')
        
        if not identifier or not round_id:
            return Response({'error': 'Team identifier and round_id are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Get the team by identifier
        team = get_object_or_404(Team, identifier=identifier)
        
        # Get the round
        round_obj = get_object_or_404(Round, id=round_id)
        
        # Find the bonus for this team and round
        bonus = Bonus.objects.filter(team=team, round=round_obj).first()
        
        if not bonus:
            return Response(None, status=status.HTTP_200_OK)
        
        # Return the bonus data
        return Response(BonusSerializer(bonus).data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def place_bet(request):
    """API endpoint for placing bets"""
    try:
        team_id = request.data.get('team_id')
        bet_on_team_id = request.data.get('bet_on_team_id')
        round_id = request.data.get('round_id')

        # Check if the round is active
        if not is_round_active(round_id):
            logger.warning("Attempted to place bet for inactive round: %s. Request data: %s", 
                         round_id, request.data)
            return Response({'error': 'This round is not active'}, status=status.HTTP_400_BAD_REQUEST)
        
        team = get_object_or_404(Team, id=team_id)
        bet_on_team = get_object_or_404(Team, id=bet_on_team_id)
        round_obj = get_object_or_404(Round, id=round_id)
        
        # Check if the team has available bets
        if team.bets_available <= 0:
            logger.warning("Team %s has no available bets. Request data: %s", 
                         team.name, request.data)
            return Response({'error': 'No bets available for this team'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            odds = get_object_or_404(Odds, team=bet_on_team, round=round_obj)
        except Exception as e:
            logger.error("Failed to find odds for team %s and round %s: %s. Request data: %s", 
                        bet_on_team.name, round_obj.number, str(e), request.data)
            return Response({'error': f'No odds found for this team and round: {str(e)}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        # Create the bet
        try:
            bet = Bet.objects.create(
                team=team,
                bet_on_team=bet_on_team,
                odds=odds,
                round=round_obj,
                bet_finish=(team.bets_available == 1)
            )
        except Exception as e:
            logger.error("Failed to create bet: %s. Request data: %s", str(e), request.data)
            return Response({'error': f'Failed to create bet: {str(e)}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Reduce available bets for the team
        try:
            team.bets_available -= 1
            team.save()
        except Exception as e:
            logger.error("Failed to update team bets_available: %s. Request data: %s", 
                       str(e), request.data)
            return Response({'error': f'Failed to update team: {str(e)}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        logger.info("Bet placed successfully for team %s on team %s", 
                   team.name, bet_on_team.name)
        
        # Check if all bets are placed
        if all_bets_placed(round_id):
            logger.info("All bets are placed for round %s, moving to joust stage", round_obj.number)
            # Move to next stage
            new_round = move_to_joust_stage(round_id)
            return Response({
                'message': 'Bet placed successfully. All bets are in, moving to joust stage.',
                'new_round': RoundSerializer(new_round).data
            })
        
        return Response({'message': 'Bet placed successfully'})
    
    except Exception as e:
        logger.exception("Error in place_bet function: %s. Request data: %s", str(e), request.data)
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def mark_game(request):
    """API endpoint for recording game results"""
    logger.debug("mark_game function called with data: %s", request.data)
    try:
        team_id = request.data.get('team_id')
        game_id = request.data.get('game_id')
        winner_id = request.data.get('winner_id')
        round_id = request.data.get('round_id')
        
        # Check if the round is active
        if not is_round_active(round_id):
            logger.warning("Attempted to mark game for inactive round: %s. Request data: %s", 
                         round_id, request.data)
            return Response({'error': 'This round is not active'}, status=status.HTTP_400_BAD_REQUEST)
        
        team = get_object_or_404(Team, id=team_id)
        game = get_object_or_404(Game, id=game_id)
        winner_team = get_object_or_404(Team, id=winner_id)
        round_obj = get_object_or_404(Round, id=round_id)
        
        # Ensure the game belongs to the correct round
        if game.round.id != round_obj.id:
            logger.warning("Game does not belong to specified round. Request data: %s", request.data)
            return Response({'error': 'Game does not belong to the specified round'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the team is participating in this game
        if team.id != game.team1.id and team.id != game.team2.id:
            logger.warning("Team %s is not participating in game %s. Request data: %s", 
                         team.name, game.id, request.data)
            return Response({'error': 'Team is not participating in this game'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the winner is one of the teams in the game
        if winner_team.id != game.team1.id and winner_team.id != game.team2.id:
            logger.warning("Winner %s is not part of game %s. Request data: %s", 
                         winner_team.name, game.id, request.data)
            return Response({'error': 'Winner must be one of the teams in the game'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the game is not already finished
        if game.finished:
            logger.warning("Game %s is already finished. Request data: %s", game.id, request.data)
            return Response({'error': 'Game is already finished'}, 
                           status=status.HTTP_400_BAD_REQUEST)

        # Set the winner
        game.win = (winner_team.id == game.team1.id)  # True if team1 wins, False if team2 wins
        game.finished = True
        game.save()
        
        logger.info("Game result recorded successfully: %s won game %s", winner_team.name, game.id)
        
        # Check if all games in this round are finished
        if all_games_finished(round_id):
            # Process all winners (increase their distance)
            winners = process_winners(round_id)
            
            # Special handling for final rounds
            if round_obj.stage == "final":
                # This was a tiebreaker round, move to finished state
                # We know we have a clear winner now
                first_place = Team.objects.all().order_by('-distance').first()
                second_place = Team.objects.all().exclude(id=first_place.id).order_by('-distance').first()
                final_round = move_to_finished_stage(round_id, first_place, second_place)
                return Response({
                    'message': 'Final game recorded. Tournament is finished!',
                    'first_place': TeamSerializer(first_place).data,
                    'second_place': TeamSerializer(second_place).data,
                    'round': RoundSerializer(final_round).data
                })
            
            # Check if there's a tournament winner or ties
            first_place_ties, second_place_ties, at_finish = check_tournament_winner()
            
            if at_finish:
                if first_place_ties.count() == 1:
                    # We have a clear first place winner
                    first_place = first_place_ties.first()
                    
                    if second_place_ties.count() == 1:
                        # We have clear first and second place winners
                        second_place = second_place_ties.first()
                        final_round = move_to_finished_stage(round_id, first_place, second_place)
                        return Response({
                            'message': 'We have clear tournament winners!',
                            'first_place': TeamSerializer(first_place).data,
                            'second_place': TeamSerializer(second_place).data,
                            'round': RoundSerializer(final_round).data
                        })
                    elif second_place_ties.count() == 2:
                        # We have a clear first place but need tiebreaker for second place
                        final_round = move_to_final_stage(round_id, None, second_place_ties)
                        return Response({
                            'message': 'Clear first place winner, but we need a tiebreaker for second place!',
                            'first_place': TeamSerializer(first_place).data,
                            'second_place_ties': TeamSerializer(second_place_ties, many=True).data,
                            'round': RoundSerializer(final_round).data
                        })
                    else:
                        # We have a clear first place but more than 2 ties for second place
                        # Move to special stage for manual selection in dashboard
                        final_round = move_to_final_multiple_ties_stage(round_id, first_place, second_place_ties)
                        return Response({
                            'message': 'Clear first place winner, but multiple ties for second place. Manual selection required.',
                            'first_place': TeamSerializer(first_place).data,
                            'second_place_ties': TeamSerializer(second_place_ties, many=True).data,
                            'round': RoundSerializer(final_round).data
                        })
                elif first_place_ties.count() == 2:
                    # We have exactly 2 teams tied for first place - setup a tiebreaker
                    final_round = move_to_final_stage(round_id, first_place_ties)
                    return Response({
                        'message': 'Two teams tied for first place! Tiebreaker needed.',
                        'ties': TeamSerializer(first_place_ties, many=True).data,
                        'round': RoundSerializer(final_round).data
                    })
                else:
                    # We have more than 2 teams tied for first place - increase finish distance
                    new_round = increment_finish_distance()
                    return Response({
                        'message': 'Multiple teams tied for first place! Continuing tournament with increased finish distance.',
                        'ties': TeamSerializer(first_place_ties, many=True).data,
                        'round': RoundSerializer(new_round).data
                    })
            else:
                # No winner yet, proceed to bonus stage normally
                bonus_round = move_to_bonus_stage(round_id, winners)
                return Response({
                    'message': 'All games finished. Moving to bonus stage.',
                    'round': RoundSerializer(bonus_round).data
                })
        
        return Response({'message': 'Game result recorded successfully'})
    
    except Exception as e:
        logger.exception("Error in mark_game function: %s. Request data: %s", str(e), request.data)
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def use_bonus(request):
    """API endpoint for selecting and using bonuses"""
    try:
        team_id = request.data.get('team_id')
        bonus_type = request.data.get('bonus_type')
        bonus_target_team_id = request.data.get('bonus_target')
        round_id = request.data.get('round_id')
        
        # Check if the round is active
        if not is_round_active(round_id):
            logger.warning("Attempted to use bonus for inactive round: %s. Request data: %s", 
                         round_id, request.data)
            return Response({'error': 'This round is not active'}, status=status.HTTP_400_BAD_REQUEST)
        
        team = get_object_or_404(Team, id=team_id)
        round_obj = get_object_or_404(Round, id=round_id)
        
        # Check if the team has an unused bonus for this round
        try:
            bonus = Bonus.objects.get(team=team, round=round_obj, finished=False)
        except Bonus.DoesNotExist:
            logger.warning("No unused bonus found for team %s in round %s. Request data: %s", 
                         team.name, round_obj.number, request.data)
            return Response({'error': 'No unused bonus found for this team in current round'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Check if bonus target exists, if required
        if "distance" in bonus_type:
            if not bonus_target_team_id:
                logger.warning("Bonus target is required for %s. Request data: %s", 
                             bonus_type, request.data)
                return Response({'error': 'Bonus target is required for this bonus type'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            target_team = get_object_or_404(Team, id=bonus_target_team_id)

        # Apply bonus logic
        match bonus_type:
            case "extra_bet":
                team.bets_available += 1
                team.save()
            case "plus_distance":
                # Do not add distance if the target team is 1 away from finishing
                if target_team.distance >= settings.TOURNAMENT_FINISH_DISTANCE - 1:
                    logger.warning("Cannot add distance to team %s at distance %s. Request data: %s", 
                                 target_team.name, target_team.distance, request.data)
                    return Response({'error': 'Players must finish on their own'}, 
                                   status=status.HTTP_400_BAD_REQUEST)
                else:
                    target_team.distance += 1
                    target_team.save()
            case "minus_distance":
                # Do not reduce distance if the target team is already at 0
                if target_team.distance <= 0:
                    logger.warning("Cannot reduce distance for team %s below 0. Request data: %s", 
                                 target_team.name, request.data)
                    return Response({'error': 'Cannot reduce distance below 0'}, 
                                   status=status.HTTP_400_BAD_REQUEST)
                else:
                    target_team.distance -= 1
                    target_team.save()
            case _:
                logger.warning("Invalid bonus type: %s. Request data: %s", 
                             bonus_type, request.data)
                return Response({'error': 'Invalid bonus type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark bonus as used and update description
        bonus.finished = True
        bonus.description = f"Used bonus: {bonus_type}"
        bonus.save()
        
        logger.info("Bonus '%s' used successfully by team %s", bonus_type, team.name)
        
        # Check if all bonuses are used in this round
        if all_bonuses_used(round_id):
            logger.info("All bonuses are used for round %s, moving to new round", round_obj.number)
            # Start a new round with betting stage
            new_round = move_to_new_round(round_id)
            return Response({
                'message': 'Bonus used. All bonuses are used, starting new round.',
                'round': RoundSerializer(new_round).data
            })
        
        return Response({
            'message': f'Bonus "{bonus_type}" selected and applied for team {team.name}',
            'bonus': BonusSerializer(bonus).data
        })
    
    except Exception as e:
        logger.exception("Error in use_bonus function: %s. Request data: %s", str(e), request.data)
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_betting_table(request):
    """Return all data needed for the betting table in a single API call"""
    try:
        identifier = request.query_params.get('identifier')
        round_id = request.query_params.get('round_id')
        
        if not identifier or not round_id:
            return Response({'error': 'Team identifier and round_id are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Get active round and verify
        try:
            round_obj = Round.objects.get(id=round_id)
        except Round.DoesNotExist:
            return Response({'error': 'Round not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get player team info
        try:
            player_team = Team.objects.get(identifier=identifier)
        except Team.DoesNotExist:
            return Response({'error': 'Player team not found'}, status=status.HTTP_404_NOT_FOUND)
        
        bets_available = player_team.bets_available
        player_bets = Bet.objects.filter(team=player_team.id)
        
        # Get all teams with odds for this round
        teams = Team.objects.all().order_by('-distance')
        odds_data = Odds.objects.filter(round=round_id)
        
        # Build result table with all required data
        result_table = []
        
        for team in teams:
            # Get odds for this team
            team_odds = odds_data.filter(team=team.id).first()
            odd1 = team_odds.odd1 if team_odds else 1.0
            odd2 = team_odds.odd2 if team_odds else 1.0
            
            # Sum bets for this team by the player
            team_bets = player_bets.filter(bet_on_team=team.id)
            bet1_sum = sum(bet.odds.odd1 for bet in team_bets if bet.odds) if team_bets else 0
            bet2_sum = sum(bet.odds.odd2 for bet in team_bets if bet.odds) if team_bets else 0
            
            # Build team entry
            result_table.append({
                'id': team.id,
                'name': team.name,
                'description': team.description,
                'distance': team.distance,
                'odd1': odd1,
                'odd2': odd2,
                'bet1': bet1_sum,
                'bet2': bet2_sum,
                'is_player_team': team.id == player_team.id
            })
        
        return Response({
            'teams': result_table,
            'bets_available': bets_available,
            'round_stage': round_obj.stage
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def team_stage_statuses(request):
    """Return status of teams in the current round for all stages"""
    try:
        round_id = request.query_params.get('round_id')
        if not round_id:
            return Response({'error': 'round_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the round and its number
        round_obj = get_object_or_404(Round, id=round_id)
        round_number = round_obj.number
        
        # Get all rounds with the same number (different stages)
        all_rounds_same_number = Round.objects.filter(number=round_number)
        teams = Team.objects.all()
        result = {}
        
        for team in teams:
            # Check betting status across all betting rounds with this number
            betting_rounds = all_rounds_same_number.filter(stage='betting')
            bet_finished = False
            if betting_rounds.exists():
                for betting_round in betting_rounds:
                    bets = Bet.objects.filter(team=team, round=betting_round)
                    if bets.exists() and bets.filter(bet_finish=True).exists():
                        bet_finished = True
                        break
            
            # Check joust status across all joust rounds with this number
            joust_rounds = all_rounds_same_number.filter(stage='joust')
            joust_finished = False
            if joust_rounds.exists():
                for joust_round in joust_rounds:
                    games = Game.objects.filter(
                        (models.Q(team1=team) | models.Q(team2=team)) &
                        models.Q(round=joust_round)
                    )
                    if games.exists() and games.filter(finished=True).exists():
                        joust_finished = True
                        break
            
            # Check bonus status across all bonus rounds with this number
            bonus_rounds = all_rounds_same_number.filter(stage='bonus')
            bonus_used = False
            if bonus_rounds.exists():
                for bonus_round in bonus_rounds:
                    bonuses = Bonus.objects.filter(team=team, round=bonus_round)
                    if bonuses.exists() and bonuses.filter(finished=True).exists():
                        bonus_used = True
                        break
            
            # Add to result dictionary
            result[team.id] = {
                'bet_finished': bet_finished,
                'joust_finished': joust_finished,
                'bonus_used': bonus_used
            }
        
        return Response(result)
        
    except Exception as e:
        logger.exception("Error in team_stage_statuses: %s", str(e))
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_tournament_settings(request):
    """Return tournament settings like finish distance"""
    return Response({
        'finish_distance': settings.TOURNAMENT_FINISH_DISTANCE
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_tournament_results(request):
    """Return the tournament results including first and second place winners"""
    try:
        # Check if we're in finished stage
        try:
            active_round = Round.objects.get(active=True)
            if active_round.stage != 'finished':
                return Response({
                    'active': False,
                    'message': 'Tournament is not finished yet'
                })
        except Round.DoesNotExist:
            return Response({'error': 'No active round found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate betting results
        results = calculate_betting_results()
        
        if not results:
            return Response({'error': 'Could not calculate tournament results'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Format response
        formatted_results = {
            'active': True,
            'first_place': TeamSerializer(results['first_place']).data,
            'second_place': TeamSerializer(results['second_place']).data,
            'betting_results': []
        }
        
        # Format betting results
        for result in results['betting_results']:
            formatted_results['betting_results'].append({
                'team': TeamSerializer(result['team']).data,
                'first_place_points': result['first_place_points'],
                'second_place_points': result['second_place_points'],
                'total_points': result['total_points']
            })
        
        return Response(formatted_results)
        
    except Exception as e:
        logger.exception(f"Error in get_tournament_results: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def set_second_place_winner(request):
    """API endpoint for manually setting second place winner from dashboard"""
    try:
        team_id = request.data.get('team_id')
        
        if not team_id:
            return Response({'error': 'Team ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the team
        second_place = get_object_or_404(Team, id=team_id)
        
        # Get the active round
        try:
            active_round = Round.objects.get(active=True)
        except Round.DoesNotExist:
            return Response({'error': 'No active round found'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Get first place (team with highest distance)
        first_place = Team.objects.all().order_by('-distance').first()
        
        # Make sure we're not setting the first place team as second place
        if second_place.id == first_place.id:
            return Response({'error': 'Second place cannot be the same as first place'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Special handling for final-multiple-ties stage
        if active_round.stage == 'final-multiple-ties':
            logger.info(f"Selecting {second_place.name} as second place from multiple ties")
            # Increase first place distance by 1
            first_place.distance += 1
            first_place.save()
            # Increase the selected second place team's distance by 1
            second_place.distance += 1
            second_place.save()
            
            # Move to finished stage
            final_round = move_to_finished_stage(active_round.id, first_place, second_place)
            return Response({
                'message': f'{second_place.name} has been set as second place',
                'first_place': TeamSerializer(first_place).data,
                'second_place': TeamSerializer(second_place).data,
                'round': RoundSerializer(final_round).data
            })
        
        # Normal handling for finished stage
        elif active_round.stage == 'finished':
            logger.info(f"Manually set {second_place.name} as second place winner")
            return Response({
                'message': f'{second_place.name} has been set as second place',
                'first_place': TeamSerializer(first_place).data,
                'second_place': TeamSerializer(second_place).data
            })
        
        return Response({'error': 'Current round stage does not support selecting a second place winner'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.exception(f"Error setting second place winner: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)