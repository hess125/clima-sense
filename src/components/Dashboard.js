import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Layers, AlertTriangle, Thermometer, Leaf, Activity, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import StatCard from './StatCard';

const getRiskColor = (level) => {
  switch(level) {
    case 'Critical': return '#dc2626';
    case 'High': return '#f97316';
    case 'Medium': return '#facc15';
    case 'Low': return '#22c55e';
    default: return '#94a3b8';
  }
};

function InteractiveMap({ zones, selectedZone, onZoneSelect }) {
  const canvasRef = useRef(null);
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw base map
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Coordinate conversion
    const latToY = (lat) => height - ((lat - 24.8) * height / 0.6);
    const lonToX = (lon) => ((lon - 55.0) * width / 0.5);

    // Draw zones
    zones.forEach(zone => {
      const x = lonToX(zone.lon);
      const y = latToY(zone.lat);
      const radius = zone.heat_index * 3;

      // Glow effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
      const color = getRiskColor(zone.risk_level);
      gradient.addColorStop(0, color + 'AA');
      gradient.addColorStop(0.5, color + '44');
      gradient.addColorStop(1, color + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Circle
      ctx.strokeStyle = color;
      ctx.lineWidth = hoveredZone?.id === zone.id || selectedZone?.id === zone.id ? 3 : 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Fill
      ctx.fillStyle = color + '66';
      ctx.fill();

      // Label
      if (hoveredZone?.id === zone.id || selectedZone?.id === zone.id) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(zone.zone, x, y - radius - 8);
        ctx.shadowBlur = 0;
      }
    });
  }, [zones, selectedZone, hoveredZone]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const latToY = (lat) => canvas.height - ((lat - 24.8) * canvas.height / 0.6);
    const lonToX = (lon) => ((lon - 55.0) * canvas.width / 0.5);

    zones.forEach(zone => {
      const zx = lonToX(zone.lon);
      const zy = latToY(zone.lat);
      const dist = Math.sqrt((x - zx) ** 2 + (y - zy) ** 2);
      if (dist < zone.heat_index * 3) {
        onZoneSelect(zone);
      }
    });
  };

  const handleCanvasMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const latToY = (lat) => canvas.height - ((lat - 24.8) * canvas.height / 0.6);
    const lonToX = (lon) => ((lon - 55.0) * canvas.width / 0.5);

    let found = null;
    zones.forEach(zone => {
      const zx = lonToX(zone.lon);
      const zy = latToY(zone.lat);
      const dist = Math.sqrt((x - zx) ** 2 + (y - zy) ** 2);
      if (dist < zone.heat_index * 3) {
        found = zone;
      }
    });
    setHoveredZone(found);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        onMouseLeave={() => setHoveredZone(null)}
        className="w-full h-auto rounded-2xl cursor-pointer border border-white/20"
        style={{ maxHeight: '600px' }}
      />
      {hoveredZone && (
        <div className="absolute top-4 left-4 glass-panel text-white px-4 py-3 rounded-xl text-sm border border-white/30 max-w-xs">
          <div className="font-bold text-lg">{hoveredZone.zone}</div>
          <div className="text-xs text-white/80 mt-1">{hoveredZone.district} • {hoveredZone.type}</div>
          <div className="mt-2 text-xs">
            <span className="font-semibold">Heat: {hoveredZone.heat_index}/10</span> • 
            <span className="ml-2">Temp: {hoveredZone.surface_temp}°C</span>
          </div>
          <div className="text-xs text-white/70 mt-1">Click for full details</div>
        </div>
      )}
    </div>
  );
}

function Dashboard({ zones }) {
  const [selectedZone, setSelectedZone] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  // Calculate statistics
  const highRiskZones = zones.filter(z => z.risk_level === 'High' || z.risk_level === 'Critical').length;
  const avgHeatIndex = (zones.reduce((acc, z) => acc + z.heat_index, 0) / zones.length).toFixed(1);
  const avgVegetation = (zones.reduce((acc, z) => acc + z.vegetation, 0) / zones.length).toFixed(1);
  const totalVulnerablePop = zones.reduce((acc, z) => acc + z.vulnerable_pop, 0);

  // Filter zones
  const filteredZones = zones.filter(zone => {
    if (filterType !== 'all' && zone.type !== filterType) return false;
    if (filterRisk !== 'all' && zone.risk_level !== filterRisk) return false;
    return true;
  });

  // Vulnerability radar data (for selected zone or average)
  const vulnerabilityRadar = selectedZone ? [
    { factor: 'Heat Exposure', value: selectedZone.heat_index * 10 },
    { factor: 'Vegetation Scarcity', value: 100 - selectedZone.vegetation },
    { factor: 'Built Density', value: selectedZone.built_density },
    { factor: 'Population Density', value: Math.min(100, (selectedZone.population / 250)) },
    { factor: 'Low Albedo', value: (1 - selectedZone.albedo) * 100 },
  ] : [
    { factor: 'Heat Exposure', value: 75 },
    { factor: 'Vegetation Scarcity', value: 68 },
    { factor: 'Built Density', value: 72 },
    { factor: 'Population Density', value: 65 },
    { factor: 'Low Albedo', value: 78 },
  ];

  // Top 10 zones by heat index
  const top10Zones = [...zones].sort((a, b) => b.heat_index - a.heat_index).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="High Risk Zones"
          value={highRiskZones}
          subtitle={`out of ${zones.length} total zones`}
          color="from-red-500 to-orange-600"
        />
        <StatCard
          icon={<Thermometer className="w-6 h-6" />}
          title="Avg Heat Index"
          value={`${avgHeatIndex}/10`}
          subtitle="Across all monitored zones"
          color="from-orange-500 to-yellow-500"
        />
        <StatCard
          icon={<Leaf className="w-6 h-6" />}
          title="Vegetation Coverage"
          value={`${avgVegetation}%`}
          subtitle="City-wide average"
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="Vulnerable Population"
          value={totalVulnerablePop.toLocaleString()}
          subtitle="People at risk"
          color="from-purple-500 to-pink-600"
        />
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold text-sm">Filter by Type:</span>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="glass-input px-3 py-2 rounded-lg text-sm"
            >
              <option value="all">All Types</option>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
              <option value="industrial">Industrial</option>
              <option value="mixed">Mixed Use</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold text-sm">Filter by Risk:</span>
            <select 
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="glass-input px-3 py-2 rounded-lg text-sm"
            >
              <option value="all">All Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="ml-auto text-white/70 text-sm">
            Showing {filteredZones.length} of {zones.length} zones
          </div>
        </div>
      </div>

      {/* Map and Zone Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Dubai Heat Vulnerability Map
            </h2>
            <span className="text-white/70 text-sm">{filteredZones.length} zones displayed</span>
          </div>
          <InteractiveMap 
            zones={filteredZones} 
            selectedZone={selectedZone}
            onZoneSelect={setSelectedZone}
          />
        </div>

        {/* Zone Details Panel */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Layers className="w-5 h-5 mr-2" />
            Zone Analysis
          </h2>
          {selectedZone ? (
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded-xl border border-white/30">
                <h3 className="font-bold text-white text-lg mb-1">{selectedZone.zone}</h3>
                <p className="text-white/70 text-sm mb-3">{selectedZone.district} • {selectedZone.type}</p>
                <div className="space-y-2 text-white/90 text-sm">
                  <DetailRow label="Heat Index" value={`${selectedZone.heat_index}/10`} />
                  <DetailRow label="Surface Temp" value={`${selectedZone.surface_temp}°C`} />
                  <DetailRow label="Vegetation" value={`${selectedZone.vegetation}%`} />
                  <DetailRow label="Albedo" value={selectedZone.albedo.toFixed(2)} />
                  <DetailRow label="Built Density" value={`${selectedZone.built_density}%`} />
                  <DetailRow label="Population" value={selectedZone.population.toLocaleString()} />
                  <DetailRow label="Vulnerable Pop." value={selectedZone.vulnerable_pop.toLocaleString()} />
                  <div className="mt-3 pt-3 border-t border-white/30">
                    <span className="text-xs font-semibold text-white/70">Risk Classification</span>
                    <div 
                      className="mt-2 px-4 py-2 rounded-xl font-bold text-white text-center text-sm"
                      style={{backgroundColor: getRiskColor(selectedZone.risk_level)}}
                    >
                      {selectedZone.risk_level.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-xl border border-white/30">
                <h4 className="font-semibold text-white mb-3 text-sm">Recommended Actions</h4>
                <ul className="space-y-2 text-xs text-white/90">
                  {selectedZone.vegetation < 25 && (
                    <li className="flex items-start">
                      <Leaf className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Increase greenery by {Math.round(30 - selectedZone.vegetation)}%</span>
                    </li>
                  )}
                  {selectedZone.albedo < 0.25 && (
                    <li className="flex items-start">
                      <Activity className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Convert low-albedo rooftops to reflective materials</span>
                    </li>
                  )}
                  {selectedZone.builtDensity > 75 && (
                    <li className="flex items-start">
                      <TrendingUp className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Implement vertical gardens on buildings</span>
                    </li>
                  )}
                  {selectedZone.vulnerable_pop > 1500 && (
                    <li className="flex items-start">
                      <AlertTriangle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Priority cooling shelters needed for vulnerable populations</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-white/60">
              <MapPin className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-center">Click on a zone on the map to view detailed analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerability Radar */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {selectedZone ? `${selectedZone.zone} Vulnerability` : 'Average Vulnerability Assessment'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={vulnerabilityRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.3)" />
              <PolarAngleAxis dataKey="factor" tick={{ fill: 'white', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'white' }} />
              <Radar name="Risk Factors" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Risk Zones */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Top 10 High-Risk Zones</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top10Zones} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: 'white', fontSize: 10 }} />
              <YAxis type="category" dataKey="zone" tick={{ fill: 'white', fontSize: 9 }} width={120} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.9)', 
                  border: 'none', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="heat_index" radius={[0, 8, 8, 0]}>
                {top10Zones.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk_level)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone List */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">All Monitored Zones</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-white text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-2">Zone</th>
                <th className="text-left py-3 px-2">District</th>
                <th className="text-left py-3 px-2">Type</th>
                <th className="text-center py-3 px-2">Heat Index</th>
                <th className="text-center py-3 px-2">Temp (°C)</th>
                <th className="text-center py-3 px-2">Vegetation</th>
                <th className="text-center py-3 px-2">Population</th>
                <th className="text-center py-3 px-2">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.map((zone) => (
                <tr 
                  key={zone.id} 
                  className="border-b border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => setSelectedZone(zone)}
                >
                  <td className="py-3 px-2 font-medium">{zone.zone}</td>
                  <td className="py-3 px-2 text-white/70">{zone.district}</td>
                  <td className="py-3 px-2 text-white/70 capitalize">{zone.type}</td>
                  <td className="py-3 px-2 text-center font-bold">{zone.heat_index}</td>
                  <td className="py-3 px-2 text-center">{zone.surface_temp}</td>
                  <td className="py-3 px-2 text-center">{zone.vegetation}%</td>
                  <td className="py-3 px-2 text-center">{zone.population.toLocaleString()}</td>
                  <td className="py-3 px-2 text-center">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: getRiskColor(zone.risk_level) + '44', color: getRiskColor(zone.risk_level) }}
                    >
                      {zone.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-white/70">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

export default Dashboard;