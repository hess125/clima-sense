import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta

# Comprehensive Dubai locations with realistic coordinates
dubai_locations = [
    # Downtown & Business District
    {'name': 'Downtown Dubai', 'lat': 25.1972, 'lon': 55.2744, 'district': 'Downtown', 'type': 'commercial'},
    {'name': 'Business Bay', 'lat': 25.1876, 'lon': 55.2571, 'district': 'Business', 'type': 'commercial'},
    {'name': 'DIFC', 'lat': 25.2138, 'lon': 55.2808, 'district': 'Financial', 'type': 'commercial'},
    {'name': 'Trade Centre', 'lat': 25.2285, 'lon': 55.2866, 'district': 'Business', 'type': 'commercial'},
    
    # Marina & Beach
    {'name': 'Dubai Marina', 'lat': 25.0805, 'lon': 55.1397, 'district': 'Marina', 'type': 'residential'},
    {'name': 'JBR - Jumeirah Beach', 'lat': 25.0782, 'lon': 55.1338, 'district': 'Marina', 'type': 'residential'},
    {'name': 'Palm Jumeirah', 'lat': 25.1124, 'lon': 55.1390, 'district': 'Palm', 'type': 'residential'},
    {'name': 'Bluewaters Island', 'lat': 25.0756, 'lon': 55.1209, 'district': 'Marina', 'type': 'mixed'},
    
    # Old Dubai
    {'name': 'Deira', 'lat': 25.2715, 'lon': 55.3273, 'district': 'Old Dubai', 'type': 'commercial'},
    {'name': 'Bur Dubai', 'lat': 25.2631, 'lon': 55.2972, 'district': 'Old Dubai', 'type': 'residential'},
    {'name': 'Al Karama', 'lat': 25.2511, 'lon': 55.3053, 'district': 'Old Dubai', 'type': 'residential'},
    {'name': 'Al Mankhool', 'lat': 25.2458, 'lon': 55.2897, 'district': 'Old Dubai', 'type': 'residential'},
    
    # Residential Areas
    {'name': 'Al Barsha', 'lat': 25.1122, 'lon': 55.1998, 'district': 'West Dubai', 'type': 'residential'},
    {'name': 'Al Quoz', 'lat': 25.1379, 'lon': 55.2334, 'district': 'Industrial', 'type': 'industrial'},
    {'name': 'Jumeirah 1', 'lat': 25.2328, 'lon': 55.2574, 'district': 'Jumeirah', 'type': 'residential'},
    {'name': 'Jumeirah 2', 'lat': 25.2158, 'lon': 55.2467, 'district': 'Jumeirah', 'type': 'residential'},
    {'name': 'Jumeirah 3', 'lat': 25.1962, 'lon': 55.2371, 'district': 'Jumeirah', 'type': 'residential'},
    {'name': 'Umm Suqeim', 'lat': 25.1516, 'lon': 55.2104, 'district': 'Jumeirah', 'type': 'residential'},
    
    # New Development Areas
    {'name': 'Dubai Silicon Oasis', 'lat': 25.1197, 'lon': 55.3789, 'district': 'DSO', 'type': 'technology'},
    {'name': 'International City', 'lat': 25.1689, 'lon': 55.4155, 'district': 'East Dubai', 'type': 'residential'},
    {'name': 'Discovery Gardens', 'lat': 25.0425, 'lon': 55.1385, 'district': 'West Dubai', 'type': 'residential'},
    {'name': 'Dubai Sports City', 'lat': 25.0370, 'lon': 55.2130, 'district': 'West Dubai', 'type': 'residential'},
    
    # Industrial Areas
    {'name': 'Jebel Ali Industrial', 'lat': 24.9857, 'lon': 55.0632, 'district': 'Jebel Ali', 'type': 'industrial'},
    {'name': 'Al Quoz Industrial', 'lat': 25.1249, 'lon': 55.2189, 'district': 'Industrial', 'type': 'industrial'},
    {'name': 'Ras Al Khor Industrial', 'lat': 25.1833, 'lon': 55.3667, 'district': 'Industrial', 'type': 'industrial'},
    
    # Airport & Surroundings
    {'name': 'Dubai Airport Area', 'lat': 25.2532, 'lon': 55.3657, 'district': 'Airport', 'type': 'commercial'},
    {'name': 'Al Garhoud', 'lat': 25.2447, 'lon': 55.3467, 'district': 'Airport', 'type': 'residential'},
    
    # Green Areas
    {'name': 'Dubai Hills Estate', 'lat': 25.1009, 'lon': 55.2446, 'district': 'New Dubai', 'type': 'residential'},
    {'name': 'Arabian Ranches', 'lat': 25.0521, 'lon': 55.2653, 'district': 'New Dubai', 'type': 'residential'},
    {'name': 'Mirdif', 'lat': 25.2178, 'lon': 55.4114, 'district': 'East Dubai', 'type': 'residential'},
    
    # New Developments
    {'name': 'Dubai Creek Harbour', 'lat': 25.1833, 'lon': 55.3333, 'district': 'Creek', 'type': 'mixed'},
    {'name': 'City Walk', 'lat': 25.2063, 'lon': 55.2668, 'district': 'Downtown', 'type': 'commercial'},
    {'name': 'La Mer', 'lat': 25.2357, 'lon': 55.2608, 'district': 'Jumeirah', 'type': 'commercial'},
    
    # Northern Areas
    {'name': 'Al Qusais', 'lat': 25.2888, 'lon': 55.3872, 'district': 'East Dubai', 'type': 'residential'},
    {'name': 'Al Nahda', 'lat': 25.2985, 'lon': 55.3755, 'district': 'East Dubai', 'type': 'residential'},
    {'name': 'Al Rashidiya', 'lat': 25.2825, 'lon': 55.3903, 'district': 'East Dubai', 'type': 'residential'},
    
    # Southern Areas
    {'name': 'Dubai South', 'lat': 24.8967, 'lon': 55.1611, 'district': 'South Dubai', 'type': 'mixed'},
    {'name': 'Dubai Investment Park', 'lat': 24.9833, 'lon': 55.1667, 'district': 'South Dubai', 'type': 'industrial'},
    
    # Luxury Areas
    {'name': 'Emirates Hills', 'lat': 25.0965, 'lon': 55.1727, 'district': 'West Dubai', 'type': 'residential'},
    {'name': 'Dubai Marina Heights', 'lat': 25.0858, 'lon': 55.1425, 'district': 'Marina', 'type': 'residential'},
    
    # Mixed Use
    {'name': 'Jumeirah Village Circle', 'lat': 25.0629, 'lon': 55.2082, 'district': 'West Dubai', 'type': 'residential'},
    {'name': 'Jumeirah Village Triangle', 'lat': 25.0596, 'lon': 55.1941, 'district': 'West Dubai', 'type': 'residential'},
    {'name': 'Dubai Production City', 'lat': 25.0287, 'lon': 55.1817, 'district': 'West Dubai', 'type': 'commercial'},
    
    # Additional Areas
    {'name': 'Motor City', 'lat': 25.0482, 'lon': 55.2284, 'district': 'West Dubai', 'type': 'residential'},
    {'name': 'Studio City', 'lat': 25.0446, 'lon': 55.1986, 'district': 'West Dubai', 'type': 'residential'},
    {'name': 'Academic City', 'lat': 25.1258, 'lon': 55.4056, 'district': 'East Dubai', 'type': 'educational'},
    {'name': 'Knowledge Park', 'lat': 25.1145, 'lon': 55.3856, 'district': 'East Dubai', 'type': 'educational'},
    {'name': 'Healthcare City', 'lat': 25.2369, 'lon': 55.3258, 'district': 'Medical', 'type': 'medical'},
]

def generate_heat_metrics(location):
    """Generate realistic heat metrics based on location type and district"""
    
    # Base heat index varies by location type
    base_heat = {
        'industrial': np.random.uniform(8.0, 9.5),
        'commercial': np.random.uniform(7.0, 8.5),
        'residential': np.random.uniform(6.0, 7.5),
        'mixed': np.random.uniform(6.5, 8.0),
        'technology': np.random.uniform(6.0, 7.0),
        'educational': np.random.uniform(5.5, 6.5),
        'medical': np.random.uniform(6.0, 7.0),
    }
    
    heat_index = base_heat.get(location['type'], 7.0)
    
    # Vegetation varies inversely with heat
    vegetation = max(5, min(60, 50 - (heat_index * 4) + np.random.uniform(-10, 10)))
    
    # Surface temperature correlates with heat index
    surface_temp = 40 + (heat_index * 1.5) + np.random.uniform(-2, 2)
    
    # Albedo (reflectivity) - lower in industrial areas
    albedo_base = {
        'industrial': 0.12,
        'commercial': 0.18,
        'residential': 0.25,
        'mixed': 0.22,
        'technology': 0.28,
        'educational': 0.30,
        'medical': 0.26,
    }
    albedo = albedo_base.get(location['type'], 0.20) + np.random.uniform(-0.05, 0.05)
    
    # Built density
    density_base = {
        'industrial': 85,
        'commercial': 75,
        'residential': 65,
        'mixed': 70,
        'technology': 60,
        'educational': 50,
        'medical': 55,
    }
    built_density = density_base.get(location['type'], 70) + np.random.randint(-10, 10)
    
    # Population varies by area type
    pop_base = {
        'industrial': np.random.randint(2000, 5000),
        'commercial': np.random.randint(5000, 12000),
        'residential': np.random.randint(8000, 25000),
        'mixed': np.random.randint(6000, 15000),
        'technology': np.random.randint(3000, 8000),
        'educational': np.random.randint(2000, 6000),
        'medical': np.random.randint(3000, 7000),
    }
    population = pop_base.get(location['type'], 8000)
    
    # Vulnerable population (elderly, children, outdoor workers)
    vulnerable_ratio = 0.15 + (heat_index - 5) * 0.05
    vulnerable_pop = int(population * vulnerable_ratio)
    
    # Risk level based on heat index
    if heat_index >= 8.5:
        risk_level = 'Critical'
    elif heat_index >= 7.5:
        risk_level = 'High'
    elif heat_index >= 6.5:
        risk_level = 'Medium'
    else:
        risk_level = 'Low'
    
    return {
        'id': None,  # Will be assigned later
        'zone': location['name'],
        'lat': location['lat'],
        'lon': location['lon'],
        'district': location['district'],
        'type': location['type'],
        'heat_index': round(heat_index, 1),
        'vegetation': round(vegetation, 1),
        'surface_temp': round(surface_temp, 1),
        'risk_level': risk_level,
        'population': population,
        'vulnerable_pop': vulnerable_pop,
        'albedo': round(albedo, 2),
        'built_density': built_density
    }

# Generate data for all locations
print("Generating comprehensive Dubai heat vulnerability data...")
print(f"Reviewing locations...\n")

heat_data = []
for idx, location in enumerate(dubai_locations, 1):
    metrics = generate_heat_metrics(location)
    metrics['id'] = idx
    heat_data.append(metrics)
    print(f"✓ {idx:2d}. {location['name']:30s} - Heat Index: {metrics['heat_index']}/10 ({metrics['risk_level']})")

df = pd.DataFrame(heat_data)

# Save as JSON for React app
output_file = 'heat_zones.json'
df.to_json(output_file, orient='records', indent=2)
print(f"\n Successfully generated {len(df)} heat zones!")
print(f"Data saved to: {output_file}")

# Generate summary statistics
print("\n" + "="*60)
print("📊 DUBAI HEAT VULNERABILITY SUMMARY")
print("="*60)
print(f"Total Zones Analyzed:           {len(df)}")
print(f"Critical Risk Zones:            {len(df[df['risk_level'] == 'Critical'])}")
print(f"High Risk Zones:                {len(df[df['risk_level'] == 'High'])}")
print(f"Medium Risk Zones:              {len(df[df['risk_level'] == 'Medium'])}")
print(f"Low Risk Zones:                 {len(df[df['risk_level'] == 'Low'])}")
print(f"\nAverage Heat Index:             {df['heat_index'].mean():.2f}/10")
print(f"Average Surface Temperature:    {df['surface_temp'].mean():.1f}°C")
print(f"Average Vegetation Coverage:    {df['vegetation'].mean():.1f}%")
print(f"Average Albedo:                 {df['albedo'].mean():.2f}")
print(f"\nTotal Population Monitored:     {df['population'].sum():,}")
print(f"Total Vulnerable Population:    {df['vulnerable_pop'].sum():,}")
print(f"Vulnerability Rate:             {(df['vulnerable_pop'].sum()/df['population'].sum()*100):.1f}%")

print("\n🔥 TOP 10 HIGHEST RISK ZONES:")
print("-" * 60)
top_10 = df.nlargest(10, 'heat_index')[['zone', 'heat_index', 'surface_temp', 'risk_level']]
for idx, row in top_10.iterrows():
    print(f"{row['zone']:30s} {row['heat_index']}/10  {row['surface_temp']:.1f}°C  [{row['risk_level']}]")

print("\n🌿 TOP 10 LOWEST RISK ZONES:")
print("-" * 60)
bottom_10 = df.nsmallest(10, 'heat_index')[['zone', 'heat_index', 'vegetation', 'risk_level']]
for idx, row in bottom_10.iterrows():
    print(f"{row['zone']:30s} {row['heat_index']}/10  {row['vegetation']:.1f}% veg  [{row['risk_level']}]")

print("\n" + "="*60)
print("✨ Data generation complete! Ready for visualization.")
print("="*60)