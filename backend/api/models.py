from django.db import models

class Country(models.Model):
    name = models.CharField(unique=True, max_length=100)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class League(models.Model):
    name = models.CharField(unique=True, max_length=100)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class Characteristic(models.Model):
    name = models.CharField(unique=True, max_length=100)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class FootballClub(models.Model):
    name = models.CharField(unique=True, max_length=100)
    description = models.CharField(max_length=1000)
    attendance = models.IntegerField(null=True)
    city = models.CharField(max_length=100)

    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    league = models.ForeignKey(League, on_delete=models.CASCADE)
    characteristic = models.ManyToManyField(Characteristic)

    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Team(models.Model):
    identifier = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    bets_available = models.IntegerField(default=0)
    distance = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Round(models.Model):
    number = models.IntegerField()
    active = models.BooleanField(default=False)
    stage = models.CharField(max_length=100)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Round {self.number} - {self.stage}"

class Game(models.Model):
    team1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team1_games')
    team2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team2_games')
    win = models.BooleanField(null=True, blank=True)  # True if team1 wins, False if team2 wins
    round = models.ForeignKey(Round, on_delete=models.CASCADE, related_name='games')
    finished = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.team1} vs {self.team2} (Round {self.round.number})"

class Odds(models.Model):
    round = models.ForeignKey(Round, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    odd1 = models.FloatField()
    odd2 = models.FloatField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.team.name} - Round {self.round.number}: {self.odd1}/{self.odd2}"

class Bet(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='placed_bets')
    bet_on_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='received_bets')
    odds = models.ForeignKey(Odds, on_delete=models.CASCADE, related_name='bets')
    round = models.ForeignKey(Round, on_delete=models.CASCADE, related_name='bets')
    bet_finish = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Bet: {self.team} on {self.bet_on_team} (Round {self.round.number})"

class Bonus(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='bonuses')
    round = models.ForeignKey(Round, on_delete=models.CASCADE, related_name='bonuses')
    finished = models.BooleanField(default=False)
    description = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Bonus for {self.team.name} in Round {self.round.number}"
