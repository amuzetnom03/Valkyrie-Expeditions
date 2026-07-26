'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  MapPin, 
  Compass, 
  Thermometer, 
  Wind, 
  Activity, 
  ShieldAlert, 
  Navigation,
  ChevronRight,
  Info
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ExpeditionMap from '@/components/ExpeditionMap';
import WeatherPanel from '@/components/WeatherPanel';
import TrackingPanel from '@/components/TrackingPanel';
import LogisticsBoard from '@/components/LogisticsBoard';
import MissionForm from '@/components/MissionForm';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Expedition, MissionStatus, TravelerInfo } from '@/types/expedition';
import { getDb } from '@/lib/firebase';
import { doc, setDoc, Timestamp, collection, getDocs } from 'firebase/firestore';
import { getAccessToken } from '@/lib/google-auth';

const EXPEDITIONS: Expedition[] = [
  {
    id: 'k2',
    name: 'K2 Base Camp',
    coords: '35.8813° N, 76.5133° E',
    lat: 35.8813,
    lng: 76.5133,
    desc: 'Operational Briefing: Mandatory logistical, safety, and financial requirements for high-altitude glacial traversal.',
    status: 'PREPARING',
    overview: {
      dest: '5,150m ASL',
      window: 'JUN — SEP',
      route: 'Baltoro Glacier',
      hub: 'Skardu, PK',
    },
    environment: {
      desc: 'Highly variable thermal shifts and extreme UV exposure.',
      dayTemp: '+15°C',
      dayWidth: '70%',
      nightTemp: '-15°C',
      nightWidth: '30%',
    },
    weight: {
      porter: 15,
      personal: 7,
      porterWidth: '75%',
      personalWidth: '35%',
    },
    financials: [
      { category: 'Trekking Package (Guide, Porters, Meals)', amount: '$1,400' },
      { category: 'Logistics (Flights/4x4 Transfers)', amount: '$450' },
      { category: 'Accommodation (Islamabad/Skardu)', amount: '$350' },
      { category: 'Gear Rental & Crew Gratuities', amount: '$500' },
      { category: 'Contingency Fund', amount: '$300' },
    ],
    total: '$3,000',
    mapOffset: { x: '80%', y: '30%' },
    path: [
      { lat: 35.8813, lng: 76.5133 }, // Base Camp
      { lat: 35.8850, lng: 76.5180 }, // Camp 1
      { lat: 35.8900, lng: 76.5250 }, // Camp 2
      { lat: 35.8950, lng: 76.5350 }, // Camp 3
      { lat: 35.9000, lng: 76.5450 }  // Camp 4
    ]
  },
  {
    id: 'nanga',
    name: 'Nanga Parbat Base',
    coords: '35.2375° N, 74.5891° E',
    lat: 35.2375,
    lng: 74.5891,
    desc: 'Operational Briefing: Approach to the Rupal Face, the highest mountain face in the world. High technical difficulty.',
    status: 'ENROUTE',
    overview: {
      dest: '3,300m ASL',
      window: 'JUN — SEP',
      route: 'Rupal / Fairy Meadows',
      hub: 'Gilgit / Chilas, PK',
    },
    environment: {
      desc: 'Moderate to severe thermal gradients with high avalanche risk.',
      dayTemp: '+20°C',
      dayWidth: '85%',
      nightTemp: '-5°C',
      nightWidth: '20%',
    },
    weight: {
      porter: 15,
      personal: 7,
      porterWidth: '75%',
      personalWidth: '35%',
    },
    financials: [
      { category: 'Trekking Package (Guide, Porters, Meals)', amount: '$800' },
      { category: 'Logistics (Jeep Transfers)', amount: '$200' },
      { category: 'Accommodation (Fairy Meadows)', amount: '$150' },
      { category: 'Gear Rental & Crew Gratuities', amount: '$300' },
      { category: 'Contingency Fund', amount: '$150' },
    ],
    total: '$1,600',
    mapOffset: { x: '40%', y: '60%' },
    path: [
      { lat: 35.2375, lng: 74.5891 }, // Base Camp
      { lat: 35.2320, lng: 74.5850 }, // Camp 1
      { lat: 35.2280, lng: 74.5800 }, // Camp 2
      { lat: 35.2250, lng: 74.5750 }  // Camp 3
    ]
  },
  {
    id: 'broad',
    name: 'Broad Peak',
    coords: '35.8050° N, 76.5683° E',
    lat: 35.8050,
    lng: 76.5683,
    desc: 'Operational Briefing: Logistical requirements for the 12th highest mountain on Earth, adjacent to K2.',
    status: 'PREPARING',
    overview: {
      dest: '4,900m ASL',
      window: 'JUN — SEP',
      route: 'Baltoro Glacier',
      hub: 'Skardu, PK',
    },
    environment: {
      desc: 'Extreme cold and variable thermal shifts. High wind speeds.',
      dayTemp: '+10°C',
      dayWidth: '60%',
      nightTemp: '-18°C',
      nightWidth: '40%',
    },
    weight: {
      porter: 15,
      personal: 7,
      porterWidth: '75%',
      personalWidth: '35%',
    },
    financials: [
      { category: 'Trekking Package (Guide, Porters, Meals)', amount: '$1,300' },
      { category: 'Logistics (Flights/4x4 Transfers)', amount: '$450' },
      { category: 'Accommodation (Islamabad/Skardu)', amount: '$350' },
      { category: 'Gear Rental & Crew Gratuities', amount: '$400' },
      { category: 'Contingency Fund', amount: '$300' },
    ],
    total: '$2,800',
    mapOffset: { x: '75%', y: '35%' },
    path: [
      { lat: 35.8050, lng: 76.5683 }, // Base Camp
      { lat: 35.8100, lng: 76.5750 }, // Camp 1
      { lat: 35.8150, lng: 76.5850 }  // Camp 2
    ]
  },
];

export default function ExpeditionDashboard() {
  const [selectedId, setSelectedId] = useState(EXPEDITIONS[0].id);
  const [isTracking, setIsTracking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [allTravelers, setAllTravelers] = useState<any[]>([]);
  const [localStatuses, setLocalStatuses] = useState<Record<string, MissionStatus>>({
    k2: 'PREPARING',
    nanga: 'ENROUTE',
    broad: 'PREPARING'
  });

  const activeExp = EXPEDITIONS.find(e => e.id === selectedId) || EXPEDITIONS[0];
  const currentStatus = localStatuses[selectedId] || 'PREPARING';
  
  const { user, error, joinMission, triggerEmergency } = useGeolocation(selectedId, isTracking);

  const handleStartInitialization = () => {
    setIsRegistering(true);
  };

  const handleFormSubmit = async (data: TravelerInfo) => {
    if (!user) {
      await joinMission();
    }
    
    // Save traveler info to member doc
    const db = getDb();
    if (db && user) {
      const memberRef = doc(db, 'expeditions', selectedId, 'members', user.uid);
      await setDoc(memberRef, {
        travelerInfo: data,
        status: 'active',
        updatedAt: Timestamp.now()
      }, { merge: true });

      // Sync to Google Calendar
      const token = getAccessToken();
      if (token) {
        try {
          await fetch('/api/calendar', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              expeditionName: activeExp.name,
              startDate: data.startDate,
              endDate: data.endDate,
              fullName: data.fullName
            })
          });
        } catch (err) {
          console.error('Failed to sync to calendar:', err);
        }
      }
    }

    setIsRegistering(false);
    setIsTracking(true);
    setLocalStatuses(prev => ({ ...prev, [selectedId]: 'ENROUTE' }));
    // Refresh logistics data
    fetchLogisticsData();
  };

  const fetchLogisticsData = async () => {
    const db = getDb();
    if (!db) return;

    // Fetch all travelers from all expeditions to consolidate
    const travelers: any[] = [];
    try {
      for (const exp of EXPEDITIONS) {
        const membersRef = collection(db, 'expeditions', exp.id, 'members');
        const snapshot = await getDocs(membersRef);
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.travelerInfo) {
            travelers.push({
              ...data.travelerInfo,
              expeditionId: exp.id,
              expeditionName: exp.name
            });
          }
        });
      }
      setAllTravelers(travelers);
    } catch (err) {
      console.error('Failed to fetch travelers:', err);
    }

    // Fetch Google Calendar events
    const token = getAccessToken();
    if (token) {
      try {
        const res = await fetch('/api/calendar', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const events = await res.json();
          setCalendarEvents(Array.isArray(events) ? events : []);
        }
      } catch (err) {
        console.error('Failed to fetch calendar events:', err);
      }
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, [selectedId]);

  const handleEmergency = () => {
    if (confirm('CRITICAL: Confirm Emergency Heli-Evac Request? Your current GPS location will be broadcast to all units.')) {
      triggerEmergency('HELI_EVAC');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#0a0a0b] text-slate-100 overflow-hidden">
      <Sidebar 
        expeditions={EXPEDITIONS} 
        selectedId={selectedId} 
        onSelect={setSelectedId} 
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-basalt-black no-scrollbar">
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-widest shadow-lg">
            System Error: {error}
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeExp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-8 md:pb-12">
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-2 py-0.5 bg-orange-500 text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                    Operational Area
                  </div>
                  <span className="font-mono text-[10px] md:text-xs text-orange-500/80 tracking-wider">
                    {activeExp.coords}
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none text-white">
                  {activeExp.name}
                </h1>
                <p className="max-w-2xl text-slate-500 text-sm md:text-lg leading-relaxed">
                  {activeExp.desc}
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                <div className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-[3px]">Mission Status</div>
                <div className="flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 bg-slate-900 border border-slate-800 rounded-lg w-full md:w-auto">
                  <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] ${
                    currentStatus === 'EMERGENCY' ? 'bg-rose-500' :
                    currentStatus === 'PREPARING' ? 'bg-emerald-500' :
                    currentStatus === 'ENROUTE' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <span className="font-mono text-xs md:text-sm font-bold">
                    {currentStatus}
                  </span>
                </div>
              </div>
            </div>

            {isRegistering ? (
              <MissionForm 
                expeditionName={activeExp.name}
                onCancel={() => setIsRegistering(false)}
                onSubmit={handleFormSubmit}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                {/* Left Column: Map & Analytics */}
                <div className="lg:col-span-8 space-y-8 md:space-y-12">
                  {/* Live Map Component */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[4px] text-slate-500">01 / Tactical GIS Overlay</h3>
                      <div className="hidden sm:flex gap-4 font-mono text-[10px] text-slate-600">
                        <span>SCALE: 1:50,000</span>
                        <span>SRC: SENTINEL-2B</span>
                      </div>
                    </div>
                    <div className="aspect-[16/10] sm:aspect-[21/9] lg:aspect-[16/7] w-full">
                      <ExpeditionMap 
                        expeditionId={activeExp.id} 
                        lat={activeExp.lat} 
                        lng={activeExp.lng} 
                        path={activeExp.path}
                      />
                    </div>
                  </div>

                  {/* Tracking & Logistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-4">
                      <h3 className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[4px] text-slate-500">02 / Personnel Telemetry</h3>
                      <TrackingPanel expeditionId={activeExp.id} onEmergency={handleEmergency} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[4px] text-slate-500">03 / Financial Allocation</h3>
                      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 md:p-6 flex flex-col justify-center">
                         <table className="w-full text-left font-mono text-[10px] md:text-[11px] uppercase tracking-wider">
                          <thead className="text-slate-600">
                            <tr>
                              <th className="pb-4 font-normal">Category</th>
                              <th className="pb-4 font-normal text-right">USD</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {activeExp.financials.map((fin, i) => (
                              <tr key={i} className="text-slate-400">
                                <td className="py-2.5 md:py-3 leading-tight">{fin.category}</td>
                                <td className="py-2.5 md:py-3 text-right font-bold text-slate-300">{fin.amount}</td>
                              </tr>
                            ))}
                            <tr className="text-white font-black border-t-2 border-slate-700">
                              <td className="pt-4">Total Budget</td>
                              <td className="pt-4 text-right text-orange-500 text-base md:text-lg">{activeExp.total}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Environment & Prep */}
                <div className="lg:col-span-4 space-y-8 md:space-y-12">
                  {/* Weather Panel */}
                  <div className="space-y-4">
                    <h3 className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[4px] text-slate-500">04 / Weather Analysis</h3>
                    <WeatherPanel />
                  </div>

                  {/* Logistics Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[4px] text-slate-500">05 / Tactical Logistics</h3>
                    <LogisticsBoard travelers={allTravelers} events={calendarEvents} />
                  </div>

                  {/* Mandatory Gear */}
                  <div className="space-y-4">
                     <h3 className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[4px] text-slate-500">06 / Strategic Gear</h3>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                         <span className="text-[9px] font-mono text-orange-500 uppercase mb-2 block">Footwear</span>
                         <ul className="text-[10px] text-slate-400 space-y-1 font-mono">
                           <li>High-Alt Boots</li>
                           <li>Glacier Crampons</li>
                           <li>Double Socks</li>
                         </ul>
                       </div>
                       <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                         <span className="text-[9px] font-mono text-orange-500 uppercase mb-2 block">Safety</span>
                         <ul className="text-[10px] text-slate-400 space-y-1 font-mono">
                           <li>Beacon / SAT-Phone</li>
                           <li>Cat 4 Eyewear</li>
                           <li>Med-Kit (AMS)</li>
                         </ul>
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Area */}
            <div className="pt-8 md:pt-12 pb-16 md:pb-24 border-t border-slate-800">
              <motion.button
                onClick={handleStartInitialization}
                disabled={isTracking || isRegistering}
                whileHover={{ scale: isTracking || isRegistering ? 1 : 1.01, backgroundColor: isTracking || isRegistering ? '#1e293b' : '#ea580c' }}
                whileTap={{ scale: 0.99 }}
                className={`w-full py-6 md:py-10 font-black text-lg sm:text-xl md:text-2xl uppercase tracking-[6px] md:tracking-[10px] rounded-xl shadow-[0_0_40px_rgba(234,88,12,0.2)] transition-colors group relative overflow-hidden ${
                  isTracking ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-orange-600 text-white'
                }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-4 md:gap-6">
                  <span className="text-center">{isTracking ? 'Mission Protocol Initialized' : 'Initialize Mission Protocol'}</span>
                  <ChevronRight size={24} className={`transition-transform flex-shrink-0 ${isTracking ? 'rotate-90' : 'group-hover:translate-x-2'}`} />
                </div>
                {!isTracking && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
