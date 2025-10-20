import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { Thermometer, Leaf, AlertTriangle, TrendingUp, Navigation, MapPin, Download, Menu, X, Building2, Trees, Zap, Users, Cloud, Sun } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Import your generated data
import generatedData from './data/heat_zones.json';

// Fix Leaflet icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const getRiskColor = (level) => {
  switch(level) {
    case 'Critical': return '#dc2626';
    case 'High': return '#f97316';
    case 'Medium': return '#fbbf24';
    case 'Low': return '#10b981';
    default: return '#94a3b8';
  }
};

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        name: `Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
      });
    },
  });
  return null;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedZone, setSelectedZone] = useState(null);
  const [urbanDevelopment, setUrbanDevelopment] = useState(50);
  const [greenDevelopment, setGreenDevelopment] = useState(50);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [zones, setZones] = useState([]);
  
  // CoolPath states
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [selectingStart, setSelectingStart] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [routePath, setRoutePath] = useState([]);

  useEffect(() => {
    // Load generated data
    setZones(generatedData);
  }, []);

  // Calculate adjusted metrics based on sliders
  const calculateAdjustedMetrics = () => {
    const urbanImpact = (urbanDevelopment - 50) / 50;
    const greenImpact = (greenDevelopment - 50) / 50;
    
    return zones.map(zone => ({
      ...zone,
      adjustedHeatIndex: Math.max(1, Math.min(10, zone.heat_index + (urbanImpact * 1.5) - (greenImpact * 2))),
      adjustedVegetation: Math.max(5, Math.min(80, zone.vegetation + (greenImpact * 30) - (urbanImpact * 10))),
      adjustedTemp: Math.max(35, Math.min(60, zone.surface_temp + (urbanImpact * 5) - (greenImpact * 8)))
    }));
  };

  const adjustedZones = calculateAdjustedMetrics();
  const avgHeatIndex = adjustedZones.length > 0 ? (adjustedZones.reduce((acc, z) => acc + z.adjustedHeatIndex, 0) / adjustedZones.length).toFixed(1) : '0.0';
  const avgVegetation = adjustedZones.length > 0 ? (adjustedZones.reduce((acc, z) => acc + z.adjustedVegetation, 0) / adjustedZones.length).toFixed(1) : '0.0';
  const highRiskZones = adjustedZones.filter(z => z.adjustedHeatIndex >= 7.5).length;
  const totalVulnerablePop = adjustedZones.reduce((acc, z) => acc + (z.vulnerable_pop || 0), 0);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12);
    doc.text('Desert HeatLens Report', 20, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text('Climate Resilience Intelligence for UAE', 20, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 37);
    
    // Summary Statistics
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary Statistics', 20, 50);
    
    doc.setFontSize(10);
    doc.text(`Total Zones Analyzed: ${adjustedZones.length}`, 20, 60);
    doc.text(`High Risk Zones: ${highRiskZones}`, 20, 67);
    doc.text(`Average Heat Index: ${avgHeatIndex}/10`, 20, 74);
    doc.text(`Average Vegetation: ${avgVegetation}%`, 20, 81);
    doc.text(`Vulnerable Population: ${totalVulnerablePop.toLocaleString()}`, 20, 88);
    
    // Development Settings
    doc.setFontSize(14);
    doc.text('Current Scenario Settings', 20, 105);
    doc.setFontSize(10);
    doc.text(`Urban Development: ${urbanDevelopment}%`, 20, 115);
    doc.text(`Green Development: ${greenDevelopment}%`, 20, 122);
    
    // Zone Data Table
    doc.setFontSize(14);
    doc.text('Heat Vulnerability Zones', 20, 140);
    
    const tableData = adjustedZones.slice(0, 10).map(zone => [
      zone.zone,
      zone.adjustedHeatIndex.toFixed(1),
      zone.adjustedTemp.toFixed(1) + '°C',
      zone.adjustedVegetation.toFixed(1) + '%',
      zone.risk_level
    ]);
    
    doc.autoTable({
      startY: 145,
      head: [['Zone', 'Heat Index', 'Temperature', 'Vegetation', 'Risk Level']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [251, 146, 60] },
    });
    
    // Recommendations
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Key Recommendations', 20, finalY);
    doc.setFontSize(10);
    doc.text(`• Prioritize cooling interventions in ${highRiskZones} high-risk zones`, 20, finalY + 10);
    doc.text(`• Increase urban vegetation coverage to above 30%`, 20, finalY + 17);
    doc.text(`• Implement reflective roofing materials in industrial areas`, 20, finalY + 24);
    doc.text(`• Establish cooling shelters for vulnerable populations`, 20, finalY + 31);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('Desert HeatLens © 2024 | Powered by AI & Satellite Data', 20, 285);
    
    // Save
    doc.save('Desert-HeatLens-Report.pdf');
  };

  const handleLocationSelect = (location) => {
    if (selectingStart) {
      setStartLocation(location);
      setSelectingStart(false);
      alert(`Start location set: ${location.name}`);
    } else if (selectingEnd) {
      setEndLocation(location);
      setSelectingEnd(false);
      alert(`End location set: ${location.name}`);
      
      // Generate simple route if both locations are set
      if (startLocation) {
        generateRoute(startLocation, location);
      }
    }
  };

  const generateRoute = (start, end) => {
    // Simple straight line route for demo
    // In production, you'd use a routing API
    const path = [
      [start.lat, start.lng],
      [(start.lat + end.lat) / 2, (start.lng + end.lng) / 2],
      [end.lat, end.lng]
    ];
    setRoutePath(path);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="glass-header">
        <div className="container-custom">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <Thermometer className="w-7 h-7 text-white" />
              </div>
              <div className="logo-text">
                <h1>Desert HeatLens</h1>
                <p className="hidden sm:block">Climate Resilience Intelligence</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="nav-desktop">
              {['dashboard', 'predictions', 'coolpath'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab === 'dashboard' && '🏠 Dashboard'}
                  {tab === 'predictions' && '🤖 AI Urban Mirage'}
                  {tab === 'coolpath' && '🧭 CoolPath'}
                </button>
              ))}
              <button onClick={handleDownloadPDF} className="nav-btn download-btn">
                <Download className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="nav-mobile">
              {['dashboard', 'predictions', 'coolpath'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`nav-btn-mobile ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab === 'dashboard' && '🏠 Dashboard'}
                  {tab === 'predictions' && '🤖 AI Urban Mirage'}
                  {tab === 'coolpath' && '🧭 CoolPath'}
                </button>
              ))}
              <button
                onClick={() => {
                  handleDownloadPDF();
                  setMobileMenuOpen(false);
                }}
                className="nav-btn-mobile download-btn"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            zones={adjustedZones}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            avgHeatIndex={avgHeatIndex}
            avgVegetation={avgVegetation}
            highRiskZones={highRiskZones}
            totalVulnerablePop={totalVulnerablePop}
          />
        )}

        {activeTab === 'predictions' && (
          <Predictions 
            urbanDevelopment={urbanDevelopment}
            setUrbanDevelopment={setUrbanDevelopment}
            greenDevelopment={greenDevelopment}
            setGreenDevelopment={setGreenDevelopment}
            zones={adjustedZones}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            handleDownloadPDF={handleDownloadPDF}
          />
        )}

        {activeTab === 'coolpath' && (
          <CoolPath 
            zones={adjustedZones}
            startLocation={startLocation}
            endLocation={endLocation}
            setSelectingStart={setSelectingStart}
            setSelectingEnd={setSelectingEnd}
            selectingStart={selectingStart}
            selectingEnd={selectingEnd}
            onLocationSelect={handleLocationSelect}
            routePath={routePath}
            setRoutePath={setRoutePath}
            setStartLocation={setStartLocation}
            setEndLocation={setEndLocation}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="glass-footer">
        <div className="container-custom footer-content">
          <p>© 2024 Desert HeatLens | Climate Resilience Intelligence for UAE</p>
          <p className="footer-subtitle">Powered by AI, Satellite Data & Machine Learning</p>
          
          {/* Data Sources - Compact */}
          <div className="data-sources-compact">
            <h4>Data Sources:</h4>
            <div className="sources-list">
              <span>🛰️ MODIS LST</span>
              <span>🌍 Sentinel-2</span>
              <span>🌿 NDVI/EVI</span>
              <span>🏗️ OpenStreetMap</span>
              <span>🤖 ML Models</span>
              <span>📊 Climate Data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Dashboard({ zones, selectedZone, setSelectedZone, avgHeatIndex, avgVegetation, highRiskZones, totalVulnerablePop }) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="High Risk Zones"
          value={highRiskZones}
          subtitle={`out of ${zones.length} zones`}
          color="from-red-500 to-orange-500"
        />
        <StatCard
          icon={<Thermometer className="w-6 h-6" />}
          title="Avg Heat Index"
          value={`${avgHeatIndex}/10`}
          subtitle="Current average"
          color="from-orange-500 to-yellow-500"
        />
        <StatCard
          icon={<Leaf className="w-6 h-6" />}
          title="Vegetation"
          value={`${avgVegetation}%`}
          subtitle="City coverage"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="At Risk"
          value={Math.floor(totalVulnerablePop / 1000) + 'K'}
          subtitle="Vulnerable population"
          color="from-purple-500 to-pink-500"
        />
      </div>

      {/* Map and Zone Details */}
      <div className="map-details-grid">
        <div className="glass-card map-card">
          <h2 className="card-title">
            <MapPin className="w-5 h-5" />
            Heat Vulnerability Map
          </h2>
          <div className="map-container">
            {zones.length > 0 && (
              <MapContainer
                center={[25.2048, 55.2708]}
                zoom={10}
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {zones.map((zone) => (
                  <CircleMarker
                    key={zone.id}
                    center={[zone.lat, zone.lon]}
                    radius={zone.adjustedHeatIndex * 3}
                    pathOptions={{
                      color: getRiskColor(zone.risk_level),
                      fillColor: getRiskColor(zone.risk_level),
                      fillOpacity: 0.6,
                      weight: 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedZone(zone)
                    }}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h3>{zone.zone}</h3>
                        <p><strong>Heat Index:</strong> {zone.adjustedHeatIndex.toFixed(1)}/10</p>
                        <p><strong>Temperature:</strong> {zone.adjustedTemp.toFixed(1)}°C</p>
                        <p><strong>Vegetation:</strong> {zone.adjustedVegetation.toFixed(1)}%</p>
                        <p><strong>Risk:</strong> <span style={{color: getRiskColor(zone.risk_level), fontWeight: 'bold'}}>{zone.risk_level}</span></p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        <div className="glass-card zone-details-card">
          <h2 className="card-title">
            <MapPin className="w-5 h-5" />
            Zone Details
          </h2>
          {selectedZone ? (
            <ZoneDetails zone={selectedZone} />
          ) : (
            <div className="empty-state">
              <MapPin className="w-12 h-12 opacity-30" />
              <p>Click a zone on the map to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="glass-card">
          <h3 className="chart-title">Temperature Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={zones.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="zone" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <RechartsTooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px' }} />
              <Bar dataKey="adjustedTemp" fill="url(#tempGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card">
          <h3 className="chart-title">Vegetation Coverage</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={zones.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="zone" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <RechartsTooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px' }} />
              <Bar dataKey="adjustedVegetation" fill="url(#vegGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="vegGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Predictions({ urbanDevelopment, setUrbanDevelopment, greenDevelopment, setGreenDevelopment, zones, selectedZone, setSelectedZone, handleDownloadPDF }) {
  const predictionData = [
    { year: '2020', businessAsUsual: 7.2, greenDevelopment: 7.2 },
    { year: '2022', businessAsUsual: 7.5, greenDevelopment: 7.3 },
    { year: '2024', businessAsUsual: 7.8, greenDevelopment: 7.2 },
    { year: '2026', businessAsUsual: 8.2, greenDevelopment: 6.9 },
    { year: '2028', businessAsUsual: 8.6, greenDevelopment: 6.5 },
    { year: '2030', businessAsUsual: 9.1, greenDevelopment: 6.0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="glass-card p-6">
        <div className="predictions-header">
          <div>
            <h2 className="section-title">
              <TrendingUp className="w-6 h-6" />
              AI Urban Mirage - 2030 Predictions
            </h2>
            <p className="section-subtitle">Machine learning forecasts based on satellite time series analysis</p>
          </div>
          <button onClick={handleDownloadPDF} className="btn-primary">
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={predictionData}>
            <defs>
              <linearGradient id="colorBusiness" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="year" />
            <YAxis domain={[5, 10]} />
            <RechartsTooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px' }} />
            <Legend />
            <Area type="monotone" dataKey="businessAsUsual" stroke="#dc2626" fillOpacity={1} fill="url(#colorBusiness)" name="Business as Usual" />
            <Area type="monotone" dataKey="greenDevelopment" stroke="#10b981" fillOpacity={1} fill="url(#colorGreen)" name="Green Development" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Future Scenario Simulator */}
      <div className="glass-card p-6">
        <h2 className="card-title">
          <Zap className="w-5 h-5" />
          Future Scenario Simulator
        </h2>
        <p className="section-subtitle mb-6">
          Adjust sliders to see real-time impact on heat zones
        </p>

        <div className="sliders-container">
          <SliderControl
            icon={<Building2 className="w-5 h-5" />}
            label="Urban Infrastructure"
            value={urbanDevelopment}
            onChange={setUrbanDevelopment}
            color="orange"
          />
          <SliderControl
            icon={<Trees className="w-5 h-5" />}
            label="Green Landscapes"
            value={greenDevelopment}
            onChange={setGreenDevelopment}
            color="green"
          />
        </div>

        <ImpactMetrics 
          urbanDevelopment={urbanDevelopment}
          greenDevelopment={greenDevelopment}
          zones={zones}
        />
      </div>

      {/* Map with Real-time Updates */}
      <div className="map-details-grid">
        <div className="glass-card map-card">
          <h2 className="card-title">
            <MapPin className="w-5 h-5" />
            Real-time Heat Zone Updates
          </h2>
          <div className="map-container">
            {zones.length > 0 && (
              <MapContainer
                center={[25.2048, 55.2708]}
                zoom={10}
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {zones.map((zone) => (
                  <CircleMarker
                    key={zone.id}
                    center={[zone.lat, zone.lon]}
                    radius={zone.adjustedHeatIndex * 3}
                    pathOptions={{
                      color: getRiskColor(zone.risk_level),
                      fillColor: getRiskColor(zone.risk_level),
                      fillOpacity: 0.6,
                      weight: 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedZone(zone)
                    }}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h3>{zone.zone}</h3>
                        <p><strong>Heat Index:</strong> {zone.adjustedHeatIndex.toFixed(1)}/10</p>
                        <p><strong>Temperature:</strong> {zone.adjustedTemp.toFixed(1)}°C</p>
                        <p><strong>Vegetation:</strong> {zone.adjustedVegetation.toFixed(1)}%</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        <div className="glass-card zone-details-card">
          <h2 className="card-title">Adjusted Zone Metrics</h2>
          {selectedZone ? (
            <ZoneDetails zone={selectedZone} />
          ) : (
            <div className="empty-state">
              <MapPin className="w-12 h-12 opacity-30" />
              <p>Click a zone to see adjusted metrics</p>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="insights-grid">
        <InsightCard
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          title="Business as Usual"
          description="Heat index could reach 9.1/10 by 2030 without intervention, a 26% increase from current levels."
          color="red"
        />
        <InsightCard
          icon={<Trees className="w-5 h-5 text-green-600" />}
          title="Green Development"
          description="Strategic greening could reduce heat to 6.0/10 by 2030, a 21% improvement from today."
          color="green"
        />
        <InsightCard
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          title="ROI Analysis"
          description="Every AED invested returns 4.3x in avoided cooling costs and health benefits over 10 years."
          color="blue"
        />
      </div>
    </div>
  );
}

function CoolPath({ zones, startLocation, endLocation, setSelectingStart, setSelectingEnd, selectingStart, selectingEnd, onLocationSelect, routePath, setRoutePath, setStartLocation, setEndLocation }) {
  const [showResults, setShowResults] = useState(false);

  const handleFindRoute = () => {
    if (startLocation && endLocation) {
      setShowResults(true);
    } else {
      alert('⚠️ Please select both start and end locations on the map');
    }
  };

  const handleReset = () => {
    setStartLocation(null);
    setEndLocation(null);
    setRoutePath([]);
    setShowResults(false);
    setSelectingStart(false);
    setSelectingEnd(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="section-title">
          <Navigation className="w-6 h-6" />
          CoolPath - Heat-Safe Navigation
        </h2>
        <p className="section-subtitle mb-6">
          Click on the map to select start and end locations, or select from zone markers
        </p>

        <div className="coolpath-grid">
          {/* Controls */}
          <div className="coolpath-controls">
            <div className="location-selector glass-light">
              <label>Starting Point</label>
              <div className="location-display">
                {startLocation ? startLocation.name : 'Not selected'}
              </div>
              <button
                onClick={() => {
                  setSelectingStart(true);
                  setSelectingEnd(false);
                }}
                className={`btn-select ${selectingStart ? 'active' : ''}`}
              >
                {selectingStart ? '📍 Click map to select...' : '🎯 Select on Map'}
              </button>
            </div>
	    <div className="location-selector glass-light">
              <label>Destination</label>
              <div className="location-display">
                {endLocation ? endLocation.name : 'Not selected'}
              </div>
              <button
                onClick={() => {
                  setSelectingEnd(true);
                  setSelectingStart(false);
                }}
                className={`btn-select ${selectingEnd ? 'active' : ''}`}
              >
                {selectingEnd ? '📍 Click map to select...' : '🎯 Select on Map'}
              </button>
            </div>

            <div className="button-group">
              <button onClick={handleFindRoute} className="btn-primary">
                <Navigation className="w-5 h-5" />
                <span>Find Coolest Route</span>
              </button>
              <button onClick={handleReset} className="btn-secondary">
                Reset
              </button>
            </div>

            {showResults && (
              <div className="route-results">
                <RouteCard
                  type="Fastest Route"
                  distance="2.4 km"
                  time="18 min"
                  avgTemp="51°C"
                  shade="25%"
                  icon="⚠️"
                  color="red"
                />
                <RouteCard
                  type="CoolPath (Recommended)"
                  distance="2.8 km"
                  time="22 min"
                  avgTemp="45°C"
                  shade="68%"
                  icon="✅"
                  color="green"
                  recommended
                />
                <div className="insight-box">
                  <p>
                    <strong>💡 Smart Insight:</strong> CoolPath saves you 6°C average temperature and reduces heat stress by 67%!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="glass-card coolpath-map">
            <h3 className="card-title">Interactive Route Map</h3>
            <div className="map-container">
              {zones.length > 0 && (
                <MapContainer
                  center={[25.2048, 55.2708]}
                  zoom={10}
                  style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <MapClickHandler onLocationSelect={onLocationSelect} />
                  
                  {/* Heat zones */}
                  {zones.map((zone) => (
                    <CircleMarker
                      key={zone.id}
                      center={[zone.lat, zone.lon]}
                      radius={zone.adjustedHeatIndex * 2}
                      pathOptions={{
                        color: getRiskColor(zone.risk_level),
                        fillColor: getRiskColor(zone.risk_level),
                        fillOpacity: 0.3,
                        weight: 1
                      }}
                      eventHandlers={{
                        click: () => {
                          const location = {
                            lat: zone.lat,
                            lng: zone.lon,
                            name: zone.zone
                          };
                          onLocationSelect(location);
                        }
                      }}
                    >
                      <Popup>
                        <div className="popup-content">
                          <h3>{zone.zone}</h3>
                          <button 
                            onClick={() => {
                              const location = {
                                lat: zone.lat,
                                lng: zone.lon,
                                name: zone.zone
                              };
                              onLocationSelect(location);
                            }}
                            className="popup-select-btn"
                          >
                            Select this location
                          </button>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}

                  {/* Start marker */}
                  {startLocation && (
                    <CircleMarker
                      center={[startLocation.lat, startLocation.lng]}
                      radius={8}
                      pathOptions={{
                        color: '#10b981',
                        fillColor: '#10b981',
                        fillOpacity: 0.8,
                        weight: 3
                      }}
                    >
                      <Popup>
                        <div className="popup-content">
                          <h4>Start: {startLocation.name}</h4>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )}

                  {/* End marker */}
                  {endLocation && (
                    <CircleMarker
                      center={[endLocation.lat, endLocation.lng]}
                      radius={8}
                      pathOptions={{
                        color: '#dc2626',
                        fillColor: '#dc2626',
                        fillOpacity: 0.8,
                        weight: 3
                      }}
                    >
                      <Popup>
                        <div className="popup-content">
                          <h4>End: {endLocation.name}</h4>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )}

                  {/* Route path */}
                  {routePath.length > 0 && (
                    <Polyline
                      positions={routePath}
                      pathOptions={{
                        color: '#3b82f6',
                        weight: 4,
                        opacity: 0.7,
                        dashArray: '10, 10'
                      }}
                    />
                  )}
                </MapContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="features-grid">
        <FeatureCard
          icon={<Thermometer className="w-8 h-8" />}
          title="Real-Time Temperature"
          description="Live satellite data updated every 30 minutes"
          color="orange"
        />
        <FeatureCard
          icon={<Sun className="w-8 h-8" />}
          title="Solar Exposure"
          description="Time-based sun angle and shadow analysis"
          color="yellow"
        />
        <FeatureCard
          icon={<Cloud className="w-8 h-8" />}
          title="Shade Mapping"
          description="Trees, covered walkways, and cooling stations"
          color="blue"
        />
      </div>
    </div>
  );
}

// Component helpers
function StatCard({ icon, title, value, subtitle, color }) {
  return (
    <div className="stat-card glass-card">
      <div className={`stat-icon bg-gradient-to-br ${color}`}>
        {/* Add this wrapper with orange color */}
        <div style={{ color: '#fb923c' }}>
          {icon}
        </div>
      </div>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </div>
  );
}

function ZoneDetails({ zone }) {
  return (
    <div className="zone-details-content">
      <div className="zone-header glass-light">
        <h3>{zone.zone}</h3>
        <p>{zone.district || 'Urban Zone'}</p>
      </div>
      
      <div className="detail-rows">
        <DetailRow label="Heat Index" value={`${zone.adjustedHeatIndex.toFixed(1)}/10`} />
        <DetailRow label="Temperature" value={`${zone.adjustedTemp.toFixed(1)}°C`} />
        <DetailRow label="Vegetation" value={`${zone.adjustedVegetation.toFixed(1)}%`} />
        <DetailRow label="Albedo" value={zone.albedo?.toFixed(2) || 'N/A'} />
        <DetailRow label="Built Density" value={`${zone.built_density || zone.builtDensity || 0}%`} />
        <DetailRow label="Population" value={(zone.population || 0).toLocaleString()} />
        <DetailRow label="Vulnerable" value={(zone.vulnerable_pop || zone.vulnerablePop || 0).toLocaleString()} />
      </div>

      <div className="risk-badge" style={{ backgroundColor: getRiskColor(zone.risk_level) }}>
        {zone.risk_level?.toUpperCase() || 'UNKNOWN'} RISK
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function SliderControl({ icon, label, value, onChange, color }) {
  const getDescription = (val) => {
    if (val < 30) return color === 'orange' ? 'Low development' : 'Minimal greenery';
    if (val < 70) return color === 'orange' ? 'Moderate development' : 'Balanced greenery';
    return color === 'orange' ? 'High development' : 'Extensive greenery';
  };

  return (
    <div className="slider-control glass-light">
      <div className="slider-header">
        <div className="slider-label">
          {icon}
          <span>{label}</span>
        </div>
        <span className={`slider-value ${color === 'orange' ? 'text-orange' : 'text-green'}`}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="slider"
      />
      <p className="slider-description">{getDescription(value)}</p>
    </div>
  );
}

function ImpactMetrics({ urbanDevelopment, greenDevelopment, zones }) {
  const heatDiff = ((urbanDevelopment - greenDevelopment) / 20).toFixed(1);
  const isPositive = greenDevelopment > urbanDevelopment;
  const highRisk = zones.filter(z => z.adjustedHeatIndex >= 7.5).length;
  
  return (
    <div className="impact-metrics">
      <div className="impact-metric glass-light">
        <div className="impact-label">Heat Impact</div>
        <div className={`impact-value ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '-' : '+'}{Math.abs(heatDiff)}°C
        </div>
      </div>
      <div className="impact-metric glass-light">
        <div className="impact-label">Vegetation</div>
        <div className={`impact-value ${greenDevelopment > 50 ? 'positive' : 'negative'}`}>
          {(greenDevelopment - 50 + 23).toFixed(0)}%
        </div>
      </div>
      <div className="impact-metric glass-light">
        <div className="impact-label">Risk Zones</div>
        <div className={`impact-value ${isPositive ? 'positive' : 'negative'}`}>
          {Math.max(0, highRisk + Math.floor((urbanDevelopment - greenDevelopment) / 20))}
        </div>
      </div>
      <div className="impact-metric glass-light">
        <div className="impact-label">Air Quality</div>
        <div className={`impact-value ${greenDevelopment > 60 ? 'positive' : greenDevelopment > 40 ? 'neutral' : 'negative'}`}>
          {greenDevelopment > 60 ? 'Good' : greenDevelopment > 40 ? 'Moderate' : 'Poor'}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, description, color }) {
  return (
    <div className={`insight-card glass-card border-${color}`}>
      <div className="insight-icon">{icon}</div>
      <div className="insight-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
}

function RouteCard({ type, distance, time, avgTemp, shade, icon, color, recommended }) {
  return (
    <div className={`route-card glass-light border-${color}`}>
      {recommended && <div className="recommended-badge">BEST</div>}
      <div className="route-header">
        <div>
          <h4>{icon} {type}</h4>
          <p className="route-meta">{distance} • {time}</p>
        </div>
        <div className="route-temp">
          <div className="temp-value">{avgTemp}</div>
          <div className="temp-label">avg temp</div>
        </div>
      </div>
      <div className="route-footer">
        <span>Shade: {shade}</span>
        {recommended && <span className="route-recommended">🌟 Recommended</span>}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="feature-card glass-card">
      <div className={`feature-icon bg-gradient-to-br from-${color}-400 to-${color}-500`}>
        {icon}
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

export default App;
