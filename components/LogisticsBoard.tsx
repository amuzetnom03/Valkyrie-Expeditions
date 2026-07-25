'use client';

import { Plane, Truck, Clock, MapPin, AlertTriangle, Wind } from 'lucide-react';
import { motion } from 'motion/react';

interface Flight {
  id: string;
  number: string;
  origin: string;
  dest: string;
  status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' | 'EN_ROUTE';
  etd: string;
}

const MOCK_FLIGHTS: Flight[] = [
  { id: '1', number: 'PK 451', origin: 'Islamabad (ISB)', dest: 'Skardu (KDU)', status: 'ON_TIME', etd: '07:30' },
  { id: '2', number: 'PK 452', origin: 'Skardu (KDU)', dest: 'Islamabad (ISB)', status: 'DELAYED', etd: '10:45' },
  { id: '3', number: 'VIP HELI', origin: 'Gilgit', dest: 'K2 Base', status: 'EN_ROUTE', etd: '09:15' },
];

const JEEP_ROUTES = [
  { from: 'Skardu', to: 'Askole', duration: '6-8h', status: 'Open', difficulty: 'High' },
  { from: 'Askole', to: 'Jhula', duration: '4h (Foot)', status: 'Restricted', difficulty: 'Moderate' },
];

export default function LogisticsBoard() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Plane size={18} className="text-blue-400" />
          <h3 className="font-bold text-lg uppercase tracking-tight text-white">Logistical Channels</h3>
        </div>
        <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded font-mono text-[10px] border border-blue-500/20">
          SKARDU_ATC_SYNCED
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Flight Board */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Clock size={12} /> Live Flight Board
          </h4>
          <div className="space-y-2">
            {MOCK_FLIGHTS.map((flight) => (
              <div key={flight.id} className="bg-black/30 border border-slate-800/50 p-3 rounded flex justify-between items-center group hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="font-mono text-xs font-bold text-orange-500">{flight.number}</div>
                  <div className="text-[10px] uppercase">
                    <span className="text-slate-400">{flight.origin}</span>
                    <span className="mx-2 text-slate-600">→</span>
                    <span className="text-white">{flight.dest}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-mono text-slate-300">{flight.etd}</div>
                  <div className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${
                    flight.status === 'ON_TIME' ? 'border-emerald-500/30 text-emerald-500' :
                    flight.status === 'DELAYED' ? 'border-yellow-500/30 text-yellow-500' :
                    'border-blue-500/30 text-blue-500'
                  }`}>
                    {flight.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Jeep / Ground Transport */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Truck size={12} /> Ground Deployment
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {JEEP_ROUTES.map((route, i) => (
              <div key={i} className="bg-black/30 border border-slate-800/50 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-mono text-white mb-1">{route.from} to {route.to}</div>
                  <div className="flex gap-2">
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Duration: {route.duration}</span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Diff: {route.difficulty}</span>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-mono text-emerald-500 uppercase font-bold">{route.status}</div>
                   <div className="text-[8px] font-mono text-slate-600">4x4_REQUIRED</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Visibility Alert */}
        <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-lg flex gap-3">
          <Wind size={24} className="text-orange-500 flex-shrink-0" />
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest">Visibility Advisory</div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Low ceiling expected at Skardu (KDU) between 08:00 - 10:30. Fixed-wing ops may revert to Gilgit.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-black/20 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <MapPin size={12} />
          BASE_STATION: SKARDU
        </div>
        <div className="animate-pulse text-blue-400">UPDATING_LIVE</div>
      </div>
    </div>
  );
}
