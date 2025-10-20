import React from 'react';

function StatCard({ icon, title, value, subtitle, color }) {
  return (
    <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-white/70 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/60 text-xs">{subtitle}</p>
    </div>
  );
}

export default StatCard;