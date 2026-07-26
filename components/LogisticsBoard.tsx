'use client';

import { Plane, Truck, Clock, MapPin, AlertTriangle, Wind, Calendar as CalendarIcon, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface LogisticsBoardProps {
  travelers?: any[];
  events?: any[];
}

export default function LogisticsBoard({ travelers = [], events = [] }: LogisticsBoardProps) {
  // Consolidation logic: Group travelers by date
  const consolidated = travelers.reduce((acc: any, traveler: any) => {
    const date = traveler.startDate;
    if (!date) return acc;
    if (!acc[date]) acc[date] = [];
    acc[date].push(traveler);
    return acc;
  }, {});

  const sharedTrips = Object.entries(consolidated)
    .filter(([_, group]: any) => group.length > 0)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-blue-400" />
          <h3 className="font-bold text-base md:text-lg uppercase tracking-tight text-white">Logistical Intelligence</h3>
        </div>
        <div className="hidden sm:block px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded font-mono text-[10px] border border-blue-500/20">
          CMD_SYNC_ACTIVE
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto max-h-[500px] no-scrollbar">
        {/* Calendar Events Section */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon size={12} /> Registered Expeditions
          </h4>
          <div className="space-y-2">
            {events.length > 0 ? (
              events.map((event, i) => (
                <div key={i} className="bg-black/30 border border-slate-800/50 p-3 rounded flex justify-between items-center">
                   <div className="space-y-1">
                     <div className="text-xs font-bold text-white uppercase">{event.summary}</div>
                     <div className="text-[10px] text-slate-400 font-mono">
                       {new Date(event.start.date || event.start.dateTime).toLocaleDateString()} — {event.description?.split('\n')[0]}
                     </div>
                   </div>
                   <div className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                     SYNCED
                   </div>
                </div>
              ))
            ) : (
              <div className="text-[10px] font-mono text-slate-600 italic py-2">No synchronized missions detected.</div>
            )}
          </div>
        </section>

        {/* Vehicle Consolidation Section */}
        <section className="space-y-3">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Users size={12} /> Vehicle Consolidation
          </h4>
          <div className="space-y-3">
            {sharedTrips.length > 0 ? (
              sharedTrips.map(([date, group]: any, i) => (
                <div key={i} className="bg-orange-500/5 border border-orange-500/20 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center border-b border-orange-500/10 pb-2">
                    <span className="text-[10px] font-mono font-bold text-orange-500">{date}</span>
                    <span className="text-[10px] font-mono text-slate-400">{group.length} PAX</span>
                  </div>
                  <div className="space-y-1">
                    {group.map((t: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-300">{t.fullName}</span>
                        <span className="text-[8px] font-mono text-slate-500 uppercase">{t.expeditionName}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="px-2 py-0.5 bg-orange-500 text-black text-[8px] font-bold rounded">
                      {group.length > 4 ? '2x JEEPS SUGGESTED' : '1x JEEP AVAILABLE'}
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">SAVINGS: ${Math.round(450 * (group.length - 1) / group.length)}/PERSON</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[10px] font-mono text-slate-600 italic py-2">No concurrent deployments for consolidation.</div>
            )}
          </div>
        </section>

        {/* Visibility Advisory (Simplified) */}
        <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-lg flex gap-3">
          <Wind size={20} className="text-orange-500 flex-shrink-0" />
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest">Visibility Advisory</div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Low ceiling expected at Skardu (KDU). Ground convoys prioritized for heavy equipment deployment.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-black/20 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <MapPin size={12} />
          CMD_CENTER: ACTIVE
        </div>
        <div className="animate-pulse text-blue-400">SYNC_OK</div>
      </div>
    </div>
  );
}
