import React from 'react';

export default function DistanceFilter({ selectedRadius, onRadiusChange, totalCount = 0 }) {
  const presetRadii = [
    { label: '2 km', value: 2 },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
    { label: '20 km', value: 20 },
    { label: 'Any', value: 50 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Radius Title & Location Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            📍
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <span>Neighbourhood Delivery Radius</span>
              <span className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {selectedRadius} km range
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {totalCount} product{totalCount !== 1 ? 's' : ''} available near your Bangalore location
            </p>
          </div>
        </div>

        {/* Preset Range Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1">Radius:</span>
          {presetRadii.map((preset) => {
            const isActive = selectedRadius === preset.value;
            return (
              <button
                key={preset.value}
                onClick={() => onRadiusChange(preset.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Interactive Slider Input */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-4">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[35px]">1 km</span>
        <input
          type="range"
          min="1"
          max="30"
          step="1"
          value={selectedRadius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-700 h-2 rounded-lg cursor-pointer"
        />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[40px]">30 km</span>
      </div>
    </div>
  );
}
