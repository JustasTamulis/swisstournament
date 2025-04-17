import json
from datetime import datetime, timezone


# Define teams and odds parameters
# Each team should have funny lithuanian name for a horse or somehow related to racing
# The names should not repeat
# The description will be altered later
teams = {
    'infusion-nfjfwinf3uh3tu89hg8879gw98h3t': {'name': 'Infusion', 'description': 'Marijus ir Greta'},
    'meta-7fg76sdf786sd7f6g': {'name': 'Mėta', 'description': 'Dominyka ir Aistė'},
    'citro-23j4h23j4h324j23h4': {'name': 'Citro', 'description': 'Kristina ir Emilija'},
    'honey-98h3g87g387fg3iug3iug3': {'name': 'Honey', 'description': 'Algis ir Emilė'},
    'imunititai-83hf83fh83f8h38fh83fh': {'name': 'Imunititai', 'description': 'Martynas ir Džiugas'},
    'malonumas-98hf983hf98h3f983hf': {'name': 'Malonumas', 'description': 'Simas ir Vilkas'},
    'gurksnis-98h3g87f3g87f3g87f3g': {'name': 'Gurkšnis', 'description': 'Aurimas ir Milda'},
    'melisa-98h3g87f3g87f3g87f3g': {'name': 'Melisa', 'description': 'Ignas ir Mantrimas'},
}

# Define odds parameters
odd1 = 10
odd2 = 5

# Current timestamp in ISO format for created/modified fields
timestamp = datetime.now(timezone.utc).isoformat()

# Initialize fixtures list
fixtures = []

# Add teams to fixtures
for i, (identifier, team_info) in enumerate(teams.items(), start=1):
    team_fixture = {
        "model": "api.team",
        "pk": i,
        "fields": {
            "identifier": identifier,
            "name": team_info['name'],
            "description": team_info['description'],
            "bets_available": 1,
            "distance": 0,
            "created": timestamp,
            "modified": timestamp
        }
    }
    fixtures.append(team_fixture)

# Add round to fixtures
round_fixture = {
    "model": "api.round",
    "pk": 1,
    "fields": {
        "number": 1,
        "active": True,
        "stage": "betting",
        "created": timestamp,
        "modified": timestamp
    }
}
fixtures.append(round_fixture)

# Add odds for each team
for i, (identifier, team_info) in enumerate(teams.items(), start=1):
    odds_fixture = {
        "model": "api.odds",
        "pk": i,
        "fields": {
            "round": 1,
            "team": i,
            "odd1": odd1,
            "odd2": odd2,
            "created": timestamp,
            "modified": timestamp
        }
    }
    fixtures.append(odds_fixture)

# Write fixtures to JSON file
output_path = '../backend/api/fixtures/initial_data.json'
with open(output_path, 'w') as f:
    json.dump(fixtures, f, indent=2)

print(f"Initial data created and saved to {output_path}")
