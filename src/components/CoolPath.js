import React, { useState } from 'react';
import { Navigation, Clock, Thermometer, Sun, CloudRain } from 'lucide-react';

function CoolPath() {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [travelMode, setTravelMode] = useState('walking');
  const [showResults, setShowResults] = useState(false);

  const handleFindRoute = () => {
    if (startLocation && endLocation) {
      setShowResults(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
          <Navigation className="w-8 h-8 mr-3" />
          CoolPath - Heat-Safe Navigation
        </h2>
        <p className="text-white/80 text-lg">
          AI-powered route finder that prioritizes thermal comfort over speed
        </p>
      </div>

      {/* Route Input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Plan Your Cool Route</h3>
          
          <div>
            <label className="text-white font-semibold mb-2 block text-sm">Starting Point</label>
            <input
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="e.g., Dubai Mall"
              className="glass-input w-full px-4 py-3 rounded-xl"
            />
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block text-sm">Destination</label>
            <input
              type="text"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder="e.g., Burj Khalifa"
              className="glass-input w-full px-4 py-3 rounded-xl"
            />
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block text-sm">Travel Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTravelMode('walking')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  travelMode === 'walking'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'glass-panel-light text-white/70 hover:text-white'
                }`}
              >
                🚶 Walking
              </button>
              <button
                onClick={() => setTravelMode('cycling')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  travelMode === 'cycling'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'glass-panel-light text-white/70 hover:text-white'
                }`}
              >
                🚴 Cycling
              </button>
            </div>
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block text-sm">Time of Day</label>
            <select className="glass-input w-full px-4 py-3 rounded-xl">
              <option>Morning (6 AM - 10 AM)</option>
              <option>Midday (10 AM - 4 PM)</option>
              <option>Evening (4 PM - 8 PM)</option>
              <option>Night (8 PM - 6 AM)</option>
            </select>
          </div>

          <button
            onClick={handleFindRoute}
            className="w-full btn-primary py-4 text-lg"
          >
            🔍 Find Coolest Route
          </button>
        </div>

        {/* Route Comparison */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">Route Comparison</h3>
          {showResults ? (
            <div className="space-y-4">
              <RouteCard
                type="Fastest Route"
                distance="2.4 km"
                time="18 min"
                heatExposure="High (12 min direct sun)"
                avgTemp="51°C"
                shade="25%"
                color="bg-red-500/30 border-red-400/50"
                icon="⚠️"
              />
              <RouteCard
                type="CoolPath (Recommended)"
                distance="2.8 km"
                time="22 min"
                heatExposure="Low (4 min direct sun)"
                avgTemp="45°C"
                shade="68%"
                color="bg-green-500/30 border-green-400/50"
                recommended
                icon="✅"
              />
              <RouteCard
                type="Balanced Route"
                distance="2.6 km"
                time="20 min"
                heatExposure="Medium (7 min direct sun)"
                avgTemp="48°C"
                shade="52%"
                color="bg-yellow-500/30 border-yellow-400/50"
                icon="⚖️"
              />

              <div className="glass-panel p-4 rounded-xl border border-blue-400/40 bg-blue-500/20">
                <div className="flex items-start space-x-3">
                  <Sun className="w-5 h-5 text-blue-300 mt-1" />
                  <div>
                    <p className="text-white text-sm font-semibold mb-1">💡 Smart Insight</p>
                    <p className="text-white/90 text-xs">
                      Taking the CoolPath saves you 6°C in average temperature exposure and reduces heat stress by 67%. 
                      The extra 4 minutes is worth it for your comfort and health!
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-white/20">
                <h4 className="font-semibold text-white mb-3 text-sm">Route Features</h4>
                <div className="space-y-2 text-xs text-white/90">
                  <RouteFeature icon="🌳" text="Passes through 3 shaded parks" />
                  <RouteFeature icon="🏢" text="Utilizes covered walkways in 4 locations" />
                  <RouteFeature icon="💧" text="3 water fountain stops available" />
                  <RouteFeature icon="❄️" text="2 air-conditioned rest areas nearby" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-white/60">
              <Navigation className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">Enter your start and end locations to find the coolest route</p>
            </div>
          )}
        </div>
      </div>

      {/* How CoolPath Works */}
      <div className="glass-card p-6">
        <h3 className="text-2xl font-bold text-white mb-6">How CoolPath Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Thermometer className="w-8 h-8" />}
            title="Real-Time Temperature Data"
            description="Integrates live satellite surface temperature data updated every 30 minutes to identify hot spots along routes."
            color="from-red-500 to-orange-600"
          />
          <FeatureCard
            icon={<Sun className="w-8 h-8" />}
            title="Solar Exposure Analysis"
            description="Calculates sun angle and shadow patterns based on time of day, building heights, and street orientation."
            color="from-yellow-500 to-orange-500"
          />
          <FeatureCard
            icon={<CloudRain className="w-8 h-8" />}
            title="Shade & Cooling Elements"
            description="Maps trees, covered walkways, misting stations, and air-conditioned passages for maximum thermal comfort."
            color="from-blue-500 to-cyan-500"
          />
        </div>
      </div>

      {/* Heat Exposure Timeline */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Heat Exposure Timeline (CoolPath Route)</h3>
        <div className="space-y-3">
          <TimelineSegment
            time="0-5 min"
            segment="Dubai Mall to Al Wasl Road"
            temp="43°C"
            shade="85%"
            status="Excellent"
            description="Indoor/covered walkway"
            color="bg-green-500"
          />
          <TimelineSegment
            time="5-12 min"
            segment="Al Wasl Road via Safa Park"
            temp="46°C"
            shade="70%"
            status="Good"
            description="Tree-lined path"
            color="bg-green-400"
          />
          <TimelineSegment
            time="12-16 min"
            segment="2nd December Street"
            temp="49°C"
            shade="40%"
            status="Moderate"
            description="Partial building shade"
            color="bg-yellow-400"
          />
          <TimelineSegment
            time="16-22 min"
            segment="Burj Khalifa Boulevard"
            temp="44°C"
            shade="75%"
            status="Excellent"
            description="Covered promenade"
            color="bg-green-500"
          />
        </div>
      </div>

      {/* Health & Safety Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">☀️ Heat Safety Tips</h3>
          <div className="space-y-3 text-white/90 text-sm">
            <SafetyTip
              icon="💧"
              title="Stay Hydrated"
              description="Drink water before, during, and after your journey. Carry at least 500ml per hour of walking."
            />
            <SafetyTip
              icon="👕"
              title="Wear Light Clothing"
              description="Choose loose, light-colored, breathable fabrics. Don't forget sunglasses and a hat."
            />
            <SafetyTip
              icon="⏰"
              title="Avoid Peak Hours"
              description="Travel before 10 AM or after 4 PM when temperatures are lower and sun angle is favorable."
            />
            <SafetyTip
              icon="🏃"
              title="Take Breaks"
              description="Rest in shaded or air-conditioned areas every 15-20 minutes during peak heat hours."
            />
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-4">📊 CoolPath Statistics</h3>
          <div className="space-y-4">
            <StatItem
              label="Routes Optimized"
              value="12,847"
              change="+23% this month"
              positive
            />
            <StatItem
              label="Avg Temperature Reduction"
              value="5.2°C"
              change="vs fastest route"
              positive
            />
            <StatItem
              label="User Satisfaction"
              value="94%"
              change="4.7/5 stars"
              positive
            />
            <StatItem
              label="Health Benefits"
              value="67%"
              change="less heat stress reported"
              positive
            />
          </div>
        </div>
      </div>

      {/* Popular Cool Routes */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">🔥 Popular Cool Routes in Dubai</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PopularRoute
            from="Dubai Mall"
            to="Burj Khalifa"
            distance="2.8 km"
            time="22 min"
            avgTemp="45°C"
            users="2,341"
          />
          <PopularRoute
            from="Marina Walk"
            to="JBR Beach"
            distance="1.5 km"
            time="12 min"
            avgTemp="43°C"
            users="1,876"
          />
          <PopularRoute
            from="City Walk"
            to="La Mer"
            distance="3.2 km"
            time="26 min"
            avgTemp="46°C"
            users="1,523"
          />
          <PopularRoute
            from="Global Village"
            to="Dubai Outlet Mall"
            distance="4.1 km"
            time="32 min"
            avgTemp="48°C"
            users="987"
          />
        </div>
      </div>

      {/* Integration Info */}
      <div className="glass-card p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">Coming Soon: Mobile App</h3>
        <p className="text-white/80 mb-6 max-w-2xl mx-auto">
          Get real-time navigation, AR shade indicators, and personalized heat alerts on your phone. 
          Sign up for early access to the CoolPath mobile app.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="btn-primary px-6 py-3">
            📱 Notify Me
          </button>
          <button className="btn-secondary px-6 py-3">
            🔗 API Access
          </button>
        </div>
      </div>
    </div>
  );
}

function RouteCard({ type, distance, time, heatExposure, avgTemp, shade, color, recommended, icon }) {
  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-lg ${color} relative`}>
      {recommended && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          RECOMMENDED
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-white text-lg">{icon} {type}</h4>
          <p className="text-white/70 text-xs mt-1">{distance} • {time}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{avgTemp}</div>
          <div className="text-xs text-white/70">avg temp</div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center text-white/90">
          <span>Heat Exposure:</span>
          <span className="font-semibold">{heatExposure}</span>
        </div>
        <div className="flex justify-between items-center text-white/90">
          <span>Shade Coverage:</span>
          <span className="font-semibold">{shade}</span>
        </div>
      </div>
    </div>
  );
}

function RouteFeature({ icon, text }) {
  return (
    <div className="flex items-center space-x-2">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/20">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
        <div className="text-white">{icon}</div>
      </div>
      <h4 className="font-bold text-white mb-2">{title}</h4>
      <p className="text-white/70 text-sm">{description}</p>
    </div>
  );
}

function TimelineSegment({ time, segment, temp, shade, status, description, color }) {
  return (
    <div className="flex items-center space-x-4 glass-panel p-3 rounded-xl border border-white/20">
      <div className={`w-2 h-16 ${color} rounded-full`}></div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <div className="font-semibold text-white text-sm">{time}</div>
            <div className="text-white/70 text-xs">{segment}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-white">{temp}</div>
            <div className="text-xs text-white/60">{shade} shade</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className={`px-2 py-0.5 rounded-full ${color} text-white font-semibold`}>{status}</span>
          <span className="text-white/70">{description}</span>
        </div>
      </div>
    </div>
  );
}

function SafetyTip({ icon, title, description }) {
  return (
    <div className="flex items-start space-x-3 glass-panel p-3 rounded-xl border border-white/20">
      <span className="text-2xl">{icon}</span>
      <div>
        <h5 className="font-semibold text-white text-sm mb-1">{title}</h5>
        <p className="text-white/70 text-xs">{description}</p>
      </div>
    </div>
  );
}

function StatItem({ label, value, change, positive }) {
  return (
    <div className="glass-panel p-4 rounded-xl border border-white/20">
      <div className="text-white/70 text-xs mb-1">{label}</div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className={`text-xs font-semibold ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </div>
      </div>
    </div>
  );
}

function PopularRoute({ from, to, distance, time, avgTemp, users }) {
  return (
    <div className="glass-panel p-4 rounded-xl border border-white/20 hover:bg-white/10 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-white font-semibold text-sm">{from} → {to}</div>
          <div className="text-white/60 text-xs mt-1">{distance} • {time}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{avgTemp}</div>
          <div className="text-xs text-white/60">avg</div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>👥 {users} users this week</span>
        <span className="text-green-400 font-semibold">Popular</span>
      </div>
    </div>
  );
}

export default CoolPath;