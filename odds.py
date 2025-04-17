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


if __name__ == "__main__":
    # Test the function with some example data
    distances = [3, 4, 5, 6, 7]
    finish_distance = 9
    
    odds = new_odds_logic(distances, finish_distance)
    print(distances)
    print(odds)

    distances = [d+1 for d in distances]
    odds = new_odds_logic(distances, finish_distance)
    print(distances)
    print(odds)