import pandas as pd
import folium
from folium.plugins import HeatMap, MarkerCluster
import json

print("🌡️ Loading heat vulnerability data...")

# Load the generated data
try:
    df = pd.read_json('heat_zones.json')
    print(f"✅ Loaded {len(df)} zones successfully!\n")
except FileNotFoundError:
    print("❌ Error: heat_zones.json not found!")
    print("Please run 'python generate_mock_data.py' first.")
    exit(1)

# Function to get color based on risk level
def get_risk_color(risk_level):
    colors = {
        'Critical': '#dc2626',
        'High': '#f97316',
        'Medium': '#facc15',
        'Low': '#22c55e'
    }
    return colors.get(risk_level, '#94a3b8')

print("🗺️ Creating interactive heat map...")

# Create base map centered on Dubai
m = folium.Map(
    location=[25.2048, 55.2708],
    zoom_start=11,
    tiles='OpenStreetMap',
    control_scale=True
)

# Add different tile layers
folium.TileLayer('CartoDB positron', name='Light Map').add_to(m)
folium.TileLayer('CartoDB dark_matter', name='Dark Map').add_to(m)

# Create marker cluster for better performance
marker_cluster = MarkerCluster(name='Heat Zones').add_to(m)

# Add individual zone markers
for idx, row in df.iterrows():
    # Create detailed popup
    popup_html = f"""
    <div style='font-family: Arial, sans-serif; width: 280px; padding: 10px;'>
        <h3 style='margin: 0 0 12px 0; color: {get_risk_color(row['risk_level'])}; border-bottom: 2px solid {get_risk_color(row['risk_level'])}; padding-bottom: 8px;'>
            🌡️ {row['zone']}
        </h3>
        
        <div style='background: #f8f9fa; padding: 10px; border-radius: 8px; margin-bottom: 10px;'>
            <p style='margin: 5px 0;'><strong>📍 District:</strong> {row['district']}</p>
            <p style='margin: 5px 0;'><strong>🏢 Type:</strong> {row['type'].title()}</p>
        </div>
        
        <table style='width: 100%; font-size: 13px; border-collapse: collapse;'>
            <tr style='background: #fff3cd;'>
                <td style='padding: 6px;'><strong>🔥 Heat Index:</strong></td>
                <td style='padding: 6px; text-align: right;'><strong>{row['heat_index']}/10</strong></td>
            </tr>
            <tr>
                <td style='padding: 6px;'><strong>🌡️ Surface Temp:</strong></td>
                <td style='padding: 6px; text-align: right;'>{row['surface_temp']:.1f}°C</td>
            </tr>
            <tr style='background: #d1e7dd;'>
                <td style='padding: 6px;'><strong>🌿 Vegetation:</strong></td>
                <td style='padding: 6px; text-align: right;'>{row['vegetation']:.1f}%</td>
            </tr>
            <tr>
                <td style='padding: 6px;'><strong>🔆 Albedo:</strong></td>
                <td style='padding: 6px; text-align: right;'>{row['albedo']:.2f}</td>
            </tr>
            <tr style='background: #f8f9fa;'>
                <td style='padding: 6px;'><strong>🏗️ Built Density:</strong></td>
                <td style='padding: 6px; text-align: right;'>{row['built_density']}%</td>
            </tr>
            <tr>
                <td style='padding: 6px;'><strong>👥 Population:</strong></td>
                <td style='padding: 6px; text-align: right;'>{row['population']:,}</td>
            </tr>
            <tr style='background: #f8d7da;'>
                <td style='padding: 6px;'><strong>⚠️ Vulnerable:</strong></td>
                <td style='padding: 6px; text-align: right;'>{row['vulnerable_pop']:,}</td>
            </tr>
        </table>
        
        <div style='margin-top: 12px; padding: 10px; background: {get_risk_color(row['risk_level'])}22; border-left: 4px solid {get_risk_color(row['risk_level'])}; border-radius: 4px;'>
            <strong style='color: {get_risk_color(row['risk_level'])};'>Risk Level: {row['risk_level'].upper()}</strong>
        </div>
    </div>
    """
    
    folium.CircleMarker(
        location=[row['lat'], row['lon']],
        radius=row['heat_index'] * 2.5,
        popup=folium.Popup(popup_html, max_width=320),
        tooltip=f"{row['zone']} - {row['risk_level']}",
        color=get_risk_color(row['risk_level']),
        fill=True,
        fillColor=get_risk_color(row['risk_level']),
        fillOpacity=0.7,
        weight=2
    ).add_to(marker_cluster)

# Add heatmap layer
heat_data = [[row['lat'], row['lon'], row['heat_index']] for idx, row in df.iterrows()]
HeatMap(
    heat_data,
    name='Heat Intensity',
    min_opacity=0.4,
    max_zoom=15,
    radius=20,
    blur=15,
    gradient={
        0.0: '#22c55e',
        0.4: '#facc15',
        0.7: '#f97316',
        1.0: '#dc2626'
    }
).add_to(m)

# Add legend
legend_html = '''
<div style="position: fixed; 
     bottom: 50px; right: 50px; width: 200px; 
     background-color: white; z-index:9999; font-size:14px;
     border:2px solid #ccc; border-radius: 12px; padding: 15px;
     box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
     <h4 style="margin: 0 0 12px 0; text-align: center; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">
        🌡️ Risk Levels
     </h4>
     <div style="margin: 8px 0; display: flex; align-items: center;">
        <span style="background-color: #dc2626; width: 24px; height: 24px; display: inline-block; border-radius: 50%; margin-right: 10px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span>
        <span style="font-weight: 500;">Critical (8.5-10)</span>
     </div>
     <div style="margin: 8px 0; display: flex; align-items: center;">
        <span style="background-color: #f97316; width: 24px; height: 24px; display: inline-block; border-radius: 50%; margin-right: 10px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span>
        <span style="font-weight: 500;">High (7.5-8.4)</span>
     </div>
     <div style="margin: 8px 0; display: flex; align-items: center;">
        <span style="background-color: #facc15; width: 24px; height: 24px; display: inline-block; border-radius: 50%; margin-right: 10px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span>
        <span style="font-weight: 500;">Medium (6.5-7.4)</span>
     </div>
     <div style="margin: 8px 0; display: flex; align-items: center;">
        <span style="background-color: #22c55e; width: 24px; height: 24px; display: inline-block; border-radius: 50%; margin-right: 10px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span>
        <span style="font-weight: 500;">Low (<6.5)</span>
     </div>
     <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #eee; font-size: 11px; color: #666; text-align: center;">
        Click markers for details
     </div>
</div>
'''
m.get_root().html.add_child(folium.Element(legend_html))

# Add layer control
folium.LayerControl().add_to(m)

# Save the map
output_file = 'heat_map.html'
m.save(output_file)
print(f"✅ Interactive map saved to: {output_file}")
print("📍 Open 'heat_map.html' in your browser to explore the data\n")

# Generate detailed statistics report
print("="*70)
print("📊 DUBAI HEAT VULNERABILITY ANALYSIS REPORT")
print("="*70)

# Overall statistics
print("\n🌍 OVERALL STATISTICS")
print("-"*70)
print(f"Total Zones Analyzed:              {len(df)}")
print(f"Geographic Coverage:               {df['district'].nunique()} districts")
print(f"Zone Types:                        {df['type'].nunique()} categories")

# Risk distribution
print("\n🔥 RISK LEVEL DISTRIBUTION")
print("-"*70)
risk_counts = df['risk_level'].value_counts()
for risk, count in risk_counts.items():
    percentage = (count / len(df)) * 100
    print(f"{risk:15s} {count:3d} zones ({percentage:5.1f}%)")

# Temperature statistics
print("\n🌡️ TEMPERATURE METRICS")
print("-"*70)
print(f"Average Heat Index:                {df['heat_index'].mean():.2f}/10")
print(f"Highest Heat Index:                {df['heat_index'].max():.2f}/10")
print(f"Lowest Heat Index:                 {df['heat_index'].min():.2f}/10")
print(f"Average Surface Temperature:       {df['surface_temp'].mean():.1f}°C")
print(f"Highest Surface Temperature:       {df['surface_temp'].max():.1f}°C")

# Vegetation statistics
print("\n🌿 VEGETATION COVERAGE")
print("-"*70)
print(f"Average Vegetation:                {df['vegetation'].mean():.1f}%")
print(f"Highest Vegetation:                {df['vegetation'].max():.1f}%")
print(f"Lowest Vegetation:                 {df['vegetation'].min():.1f}%")
print(f"Zones with <20% vegetation:        {len(df[df['vegetation'] < 20])}")

# Population statistics
print("\n👥 POPULATION IMPACT")
print("-"*70)
print(f"Total Population Monitored:        {df['population'].sum():,}")
print(f"Total Vulnerable Population:       {df['vulnerable_pop'].sum():,}")
print(f"Overall Vulnerability Rate:        {(df['vulnerable_pop'].sum()/df['population'].sum()*100):.1f}%")
print(f"Average Population per Zone:       {df['population'].mean():.0f}")

# District analysis
print("\n🏙️ DISTRICT ANALYSIS")
print("-"*70)
district_stats = df.groupby('district').agg({
    'heat_index': 'mean',
    'vegetation': 'mean',
    'population': 'sum'
}).round(2).sort_values('heat_index', ascending=False)

print(f"{'District':<25} {'Avg Heat':<12} {'Avg Veg':<12} {'Population'}")
print("-"*70)
for district, row in district_stats.head(10).iterrows():
    print(f"{district:<25} {row['heat_index']:>8.1f}/10  {row['vegetation']:>8.1f}%  {row['population']:>12,.0f}")

# Zone type analysis
print("\n🏢 ZONE TYPE ANALYSIS")
print("-"*70)
type_stats = df.groupby('type').agg({
    'heat_index': 'mean',
    'vegetation': 'mean',
    'vulnerable_pop': 'sum'
}).round(2).sort_values('heat_index', ascending=False)

print(f"{'Type':<20} {'Avg Heat':<12} {'Avg Veg':<12} {'Vulnerable Pop'}")
print("-"*70)
for zone_type, row in type_stats.iterrows():
    print(f"{zone_type.title():<20} {row['heat_index']:>8.1f}/10  {row['vegetation']:>8.1f}%  {row['vulnerable_pop']:>15,.0f}")

# Top risk zones
print("\n⚠️ TOP 15 CRITICAL ZONES (Immediate Action Required)")
print("-"*70)
top_risk = df.nlargest(15, 'heat_index')[['zone', 'district', 'heat_index', 'surface_temp', 'vulnerable_pop', 'risk_level']]
print(f"{'Zone':<30} {'District':<20} {'Heat':<8} {'Temp':<8} {'Vulnerable':<12} {'Risk'}")
print("-"*70)
for idx, row in top_risk.iterrows():
    print(f"{row['zone']:<30} {row['district']:<20} {row['heat_index']:>4.1f}/10 {row['surface_temp']:>6.1f}°C {row['vulnerable_pop']:>10,} {row['risk_level']}")

# Recommendations
print("\n💡 KEY RECOMMENDATIONS")
print("-"*70)
high_risk_zones = df[df['risk_level'].isin(['High', 'Critical'])]
low_veg_zones = df[df['vegetation'] < 20]
high_density_zones = df[df['built_density'] > 80]

print(f"1. URGENT: {len(high_risk_zones)} zones require immediate cooling interventions")
print(f"2. VEGETATION: {len(low_veg_zones)} zones need increased green cover (currently <20%)")
print(f"3. URBAN PLANNING: {len(high_density_zones)} high-density zones need albedo improvements")
print(f"4. VULNERABLE POPULATIONS: Focus on {df.nlargest(10, 'vulnerable_pop')['zone'].tolist()[:3]}")
print(f"5. INDUSTRIAL ZONES: Prioritize cooling in {len(df[df['type'] == 'industrial'])} industrial areas")

print("\n" + "="*70)
print("✨ Analysis complete! Check heat_map.html for interactive visualization")
print("="*70)

# Save detailed report to file
report_file = 'detailed_analysis_report.txt'
with open(report_file, 'w') as f:
    f.write("="*70 + "\n")
    f.write("DESERT HEATLENS - COMPREHENSIVE DUBAI HEAT ANALYSIS REPORT\n")
    f.write("="*70 + "\n\n")
    
    f.write(f"Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    f.write(f"Total Zones: {len(df)}\n")
    f.write(f"Geographic Coverage: {df['district'].nunique()} districts\n\n")
    
    f.write("CRITICAL FINDINGS:\n")
    f.write("-"*70 + "\n")
    f.write(f"• {len(df[df['risk_level'] == 'Critical'])} zones at CRITICAL risk level\n")
    f.write(f"• {len(df[df['risk_level'] == 'High'])} zones at HIGH risk level\n")
    f.write(f"• {df['vulnerable_pop'].sum():,} people in vulnerable categories\n")
    f.write(f"• Average heat index: {df['heat_index'].mean():.2f}/10\n")
    f.write(f"• {len(df[df['vegetation'] < 20])} zones with insufficient vegetation\n\n")
    
    f.write("TOP 10 PRIORITY ZONES FOR INTERVENTION:\n")
    f.write("-"*70 + "\n")
    for idx, row in df.nlargest(10, 'heat_index').iterrows():
        f.write(f"{row['zone']:<30} Heat: {row['heat_index']}/10  Vulnerable: {row['vulnerable_pop']:,}\n")

print(f"\n✅ Detailed report saved to: {report_file}")