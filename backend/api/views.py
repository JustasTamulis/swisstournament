from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.views.generic import TemplateView
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404

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
    move_to_next_stage,
    generate_new_odds,
    move_track,
    check_winner,
    all_games_finished,
    process_winners,
    move_to_bonus_stage,
    move_to_finished_stage,
    all_bonuses_used,
    move_to_new_round,
)


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


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def place_bet(request):
    """API endpoint for placing bets"""
    try:
        team_id = request.data.get('team_id')
        bet_on_team_id = request.data.get('bet_on_team_id')
        round_id = request.data.get('round_id')
        
        team = get_object_or_404(Team, id=team_id)
        bet_on_team = get_object_or_404(Team, id=bet_on_team_id)
        round_obj = get_object_or_404(Round, id=round_id)
        odds = get_object_or_404(Odds, team=bet_on_team, round=round_obj)
        
        # Create the bet
        bet = Bet.objects.create(
            team=team,
            bet_on_team=bet_on_team,
            odds=odds,
            round=round_obj,
            bet_finish=False
        )
        
        # Reduce available bets for the team
        if team.bets_available > 0:
            team.bets_available -= 1
            team.save()
        
        # Check if all bets are placed
        if all_bets_placed(round_id):
            # Move to next stage
            new_round = move_to_next_stage(round_id)
            return Response({
                'message': 'Bet placed successfully. All bets are in, moving to joust stage.',
                'new_round': RoundSerializer(new_round).data
            })
        
        return Response({'message': 'Bet placed successfully'})
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def mark_game(request):
    """API endpoint for recording game results"""
    try:
        game_id = request.data.get('game_id')
        winner_team_id = request.data.get('winner_team_id')
        
        game = get_object_or_404(Game, id=game_id)
        winner_team = get_object_or_404(Team, id=winner_team_id)
        
        # Ensure the winner is one of the teams in the game
        if winner_team.id != game.team1.id and winner_team.id != game.team2.id:
            return Response({'error': 'Winner must be one of the teams in the game'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Set the winner
        game.win = (winner_team.id == game.team1.id)  # True if team1 wins, False if team2 wins
        game.finished = True
        game.save()
        
        # Check if all games in this round are finished
        round_id = game.round.id
        if all_games_finished(round_id):
            # Process all winners
            process_winners(round_id)
            
            # Check if there's a tournament winner
            winner = check_winner()
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
                bonus_round = move_to_bonus_stage(round_id)
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
        round_id = request.data.get('round_id')
        
        team = get_object_or_404(Team, id=team_id)
        round_obj = get_object_or_404(Round, id=round_id)
        
        # Check if the team has an unused bonus for this round
        try:
            bonus = Bonus.objects.get(team=team, round=round_obj, finished=False)
        except Bonus.DoesNotExist:
            return Response({'error': 'No unused bonus found for this team in current round'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Mark bonus as used and update description
        bonus.finished = True
        bonus.description = f"Used bonus: {bonus_type}"
        bonus.save()
        
        # Apply bonus logic (placeholder for future implementation)
        # For example: if bonus_type == "extra_distance": move_track(team.id, 2)
        
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