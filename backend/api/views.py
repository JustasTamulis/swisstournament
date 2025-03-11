from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.views.generic import TemplateView
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db import models
import logging

from .models import Country, League, Characteristic, FootballClub, Team, Round, Game, Bet, Odds, Bonus
from .serializers import (
    CountrySerializer,
    LeagueSerializer,
    CharacteristicSerializer,
    FootballClubSerializer,
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
    move_track,
    check_tournament_winner,
    all_games_finished,
    process_winners,
    move_to_bonus_stage,
    move_to_finished_stage,
    all_bonuses_used,
    move_to_new_round,
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


class CountryViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Country.objects.all()
    serializer_class = CountrySerializer

    def list(self, request):
        queryset = Country.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    

class LeagueViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = League.objects.all()
    serializer_class = LeagueSerializer

    def list(self, request):
        queryset = League.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    

class CharacteristicViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Characteristic.objects.all()
    serializer_class = CharacteristicSerializer

    def list(self, request):
        queryset = Characteristic.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    

class FootballClubViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = FootballClub.objects.all()
    serializer_class = FootballClubSerializer

    def list(self, request):
        queryset = FootballClub.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    

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
            'game_id': game.id
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


from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # Add this decorator to bypass CSRF protection for this endpoint
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def place_bet(request):
    """API endpoint for placing bets"""
    logger.debug("place_bet function called with data: %s", request.data)
    try:
        team_id = request.data.get('team_id')
        bet_on_team_id = request.data.get('bet_on_team_id')
        round_id = request.data.get('round_id')
        
        logger.debug("Bet parameters - team_id: %s, bet_on_team_id: %s, round_id: %s", 
                    team_id, bet_on_team_id, round_id)
        
        # Check if the round is active
        if not is_round_active(round_id):
            logger.warning("Attempted to place bet for inactive round: %s", round_id)
            return Response({'error': 'This round is not active'}, status=status.HTTP_400_BAD_REQUEST)
        
        team = get_object_or_404(Team, id=team_id)
        logger.debug("Found team: %s (ID: %s)", team.name, team.id)
        
        bet_on_team = get_object_or_404(Team, id=bet_on_team_id)
        logger.debug("Found bet_on_team: %s (ID: %s)", bet_on_team.name, bet_on_team.id)
        
        round_obj = get_object_or_404(Round, id=round_id)
        logger.debug("Found round: %s, stage: %s", round_obj.number, round_obj.stage)
        
        # Check if the team has available bets
        if team.bets_available <= 0:
            logger.warning("Team %s has no available bets", team.name)
            return Response({'error': 'No bets available for this team'}, status=status.HTTP_400_BAD_REQUEST)
        
        logger.debug("Team %s has %d bets available", team.name, team.bets_available)
        
        try:
            odds = get_object_or_404(Odds, team=bet_on_team, round=round_obj)
            logger.debug("Found odds for team %s: odd1=%s, odd2=%s", 
                        bet_on_team.name, odds.odd1, odds.odd2)
        except Exception as e:
            logger.error("Failed to find odds for team %s and round %s: %s", 
                        bet_on_team.name, round_obj.number, str(e))
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
            logger.debug("Created bet: %s", bet)
        except Exception as e:
            logger.error("Failed to create bet: %s", str(e))
            return Response({'error': f'Failed to create bet: {str(e)}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Reduce available bets for the team
        try:
            team.bets_available -= 1
            team.save()
            logger.debug("Decreased bets_available for team %s to %d", 
                        team.name, team.bets_available)
        except Exception as e:
            logger.error("Failed to update team bets_available: %s", str(e))
            return Response({'error': f'Failed to update team: {str(e)}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if all bets are placed
        if all_bets_placed(round_id):
            logger.info("All bets are placed for round %s, moving to joust stage", round_obj.number)
            # Move to next stage
            new_round = move_to_joust_stage(round_id)
            return Response({
                'message': 'Bet placed successfully. All bets are in, moving to joust stage.',
                'new_round': RoundSerializer(new_round).data
            })
        
        logger.info("Bet placed successfully for team %s on team %s", 
                   team.name, bet_on_team.name)
        return Response({'message': 'Bet placed successfully'})
    
    except Exception as e:
        logger.exception("Error in place_bet function: %s", str(e))
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def mark_game(request):
    """API endpoint for recording game results"""
    try:
        team_id = request.data.get('team_id')
        game_id = request.data.get('game_id')
        winner_id = request.data.get('winner_id')
        round_id = request.data.get('round_id')
        
        # Check if the round is active
        if not is_round_active(round_id):
            return Response({'error': 'This round is not active'}, status=status.HTTP_400_BAD_REQUEST)
        
        team = get_object_or_404(Team, id=team_id)
        game = get_object_or_404(Game, id=game_id)
        winner_team = get_object_or_404(Team, id=winner_id)
        round_obj = get_object_or_404(Round, id=round_id)
        
        # Ensure the game belongs to the correct round
        if game.round.id != round_obj.id:
            return Response({'error': 'Game does not belong to the specified round'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the team is participating in this game
        if team.id != game.team1.id and team.id != game.team2.id:
            return Response({'error': 'Team is not participating in this game'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the winner is one of the teams in the game
        if winner_team.id != game.team1.id and winner_team.id != game.team2.id:
            return Response({'error': 'Winner must be one of the teams in the game'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Set the winner
        game.win = (winner_team.id == game.team1.id)  # True if team1 wins, False if team2 wins
        game.finished = True
        game.save()
        
        # Check if all games in this round are finished
        if all_games_finished(round_id):
            # Process all winners
            winners = process_winners(round_id)
            
            # Check if there's a tournament winner
            winner = check_tournament_winner()
            if winner:
                # Move to finished stage
                final_round = move_to_finished_stage(round_id, winner)
                return Response({
                    'message': 'Game recorded. We have a tournament winner!',
                    'winner': TeamSerializer(winner).data,
                    'round': RoundSerializer(final_round).data
                })
            else:
                # Move to bonus stage
                bonus_round = move_to_bonus_stage(round_id, winners)
                return Response({
                    'message': 'All games finished. Moving to bonus stage.',
                    'round': RoundSerializer(bonus_round).data
                })
        
        return Response({'message': 'Game result recorded successfully'})
        
    except Exception as e:
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
            return Response({'error': 'This round is not active'}, status=status.HTTP_400_BAD_REQUEST)
        
        team = get_object_or_404(Team, id=team_id)
        round_obj = get_object_or_404(Round, id=round_id)
        
        # Check if the team has an unused bonus for this round
        try:
            bonus = Bonus.objects.get(team=team, round=round_obj, finished=False)
        except Bonus.DoesNotExist:
            return Response({'error': 'No unused bonus found for this team in current round'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Check if bonus target exists, if required
        if "distance" in bonus_type:
            if not bonus_target_team_id:
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
                if target_team.distance >= 11:
                    return Response({'error': 'Players must finish on their own'}, 
                                   status=status.HTTP_400_BAD_REQUEST)
                else:
                    target_team.distance += 1
                    target_team.save()
            case "minus_distance":
                # Do not reduce distance if the target team is already at 0
                if target_team.distance <= 0:
                    return Response({'error': 'Cannot reduce distance below 0'}, 
                                   status=status.HTTP_400_BAD_REQUEST)
                else:
                    target_team.distance -= 1
                    target_team.save()
            case _:
                return Response({'error': 'Invalid bonus type'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark bonus as used and update description
        bonus.finished = True
        bonus.description = f"Used bonus: {bonus_type}"
        bonus.save()
        
        # Check if all bonuses are used in this round
        if all_bonuses_used(round_id):
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
        
        # 1. Get active round and verify
        try:
            round_obj = Round.objects.get(id=round_id)
        except Round.DoesNotExist:
            return Response({'error': 'Round not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # 2. Get player team info
        try:
            player_team = Team.objects.get(identifier=identifier)
        except Team.DoesNotExist:
            return Response({'error': 'Player team not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # 3. Get all teams with odds for this round
        teams = Team.objects.all().order_by('-distance')
        bets_available = player_team.bets_available
        
        # 4. Get all bets made by this player
        player_bets = Bet.objects.filter(team=player_team.id)
        
        # 5. Get odds for this round
        odds_data = Odds.objects.filter(round=round_id)
        
        # 6. Build result table with all required data
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