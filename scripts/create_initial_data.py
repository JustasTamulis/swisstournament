import json
from datetime import datetime, timezone


# Define teams and odds parameters
# Each team should have funny lithuanian name for a horse or somehow related to racing
# The names should not repeat
# The description will be altered later
teams = {
    'kaktomusa-nfjfwinf3uh3tu89hg8879gw98h3t': {'name': 'Kaktomuša', 'description': 'Vardas ir pavardas'},
    'papirusas-j38f7h384fh87fh38f7h3': {'name': 'Papirusas', 'description': 'Vardas ir pavardas'},
    # 'grandinine-reakcija-7fg76sdf786sd7f6g': {'name': 'Grandininė reakcija', 'description': 'Vardas ir pavardas'},
    # 'sviesos-greitis-98h3rgf87g387fg38': {'name': 'Šviesos greitis', 'description': 'Vardas ir pavardas'},
    # 'kibirkstis-23j4h23j4h324j23h4': {'name': 'Kibirkštis', 'description': 'Vardas ir pavardas'},
    # 'dobilas-98h3g87g387fg3iug3iug3': {'name': 'Dobilas', 'description': 'Vardas ir pavardas'},
    # 'zaibas-83hf83fh83f8h38fh83fh': {'name': 'Žaibas', 'description': 'Vardas ir pavardas'},
    # 'spurga-98hf983hf98h3f983hf': {'name': 'Spurga', 'description': 'Vardas ir pavardas'},
}

# Define odds parameters
odd1 = 1.5
odd2 = 2.5

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
