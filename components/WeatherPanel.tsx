'use client';

import { Cloud, Thermometer, Wind, Droplets, Sun, CloudRain, CloudLightning } from 'lucide-react';

interface ForecastDay {
  day: string;
  temp: string;
  condition: 'sunny' | 'cloudy' | 'rain' | 'storm' | 'windy';
  precip: string;
}

const MOCK_FORECAST: ForecastDay[] = [
  { day: 'MON', temp: '-14°', condition: 'sunny', precip: '2%' },
  { day: 'TUE', temp: '-12°', condition: 'windy', precip: '5%' },
  { day: 'WED', temp: '-18°', condition: 'cloudy', precip: '15%' },
  { day: 'THU', temp: '-22°', condition: 'storm', precip: '85%' },
  { day: 'FRI', temp: '-15°', condition: 'sunny', precip: '0%' },
];

export default function WeatherPanel() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 md:p-6 border-b border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Cloud size={18} className="text-blue-400" />
            <h3 className="font-bold text-base md:text-lg uppercase tracking-tight">Meteorological Data</h3>
          </div>
          <span className="hidden sm:inline text-[10px] font-mono text-slate-500">REF: SKARDU_STATION_04</span>
        </div>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">5-Day Strategic Forecast</p>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-5 gap-2">
          {MOCK_FORECAST.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-2 rounded bg-black/30 border border-slate-800/50">
              <span className="text-[8px] font-mono text-slate-500">{d.day}</span>
              <WeatherIcon condition={d.condition} size={20} />
              <span className="text-xs font-bold font-mono">{d.temp}</span>
              <span className="text-[8px] font-mono text-blue-400">{d.precip}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2 text-orange-500">
              <Wind size={18} />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Wind Alert</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Jet stream dipping to 7,000m. Sustained winds of 80km/h expected at High Camp 3 on Thursday. All summit attempts should be postponed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Droplets size={16} className="text-blue-400" />
              <div>
                <div className="text-[8px] font-mono text-slate-500 uppercase">Humidity</div>
                <div className="text-sm font-bold font-mono">18%</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sun size={16} className="text-yellow-500" />
              <div>
                <div className="text-[8px] font-mono text-slate-500 uppercase">UV Index</div>
                <div className="text-sm font-bold font-mono">Extreme (11+)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-black/20 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        SYNCED WITH ECMWF CLOUD MODEL
      </div>
    </div>
  );
}

function WeatherIcon({ condition, size }: { condition: ForecastDay['condition'], size: number }) {
  switch (condition) {
    case 'sunny': return <Sun size={size} className="text-yellow-500" />;
    case 'windy': return <Wind size={size} className="text-slate-400" />;
    case 'cloudy': return <Cloud size={size} className="text-slate-400" />;
    case 'rain': return <CloudRain size={size} className="text-blue-400" />;
    case 'storm': return <CloudLightning size={size} className="text-blue-600" />;
    default: return <Sun size={size} />;
  }
}
