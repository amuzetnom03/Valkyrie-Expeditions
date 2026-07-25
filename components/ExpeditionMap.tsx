'use client';

import { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Cloud, Wind, Thermometer, MapPin, User, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getDb } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { Member } from './TrackingPanel';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY);

interface ExpeditionMapProps {
  expeditionId: string;
  lat: number;
  lng: number;
  path?: { lat: number; lng: number }[];
}

function RoutePolyline({ path }: { path: { lat: number; lng: number }[] }) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !path || path.length < 2) return;

    // Create the polyline
    const polyline = new google.maps.Polyline({
      path: [],
      geodesic: true,
      strokeColor: '#f97316', // orange-500
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map,
    });

    polylineRef.current = polyline;

    // Animation logic - draw the path segment by segment
    let count = 0;
    const speed = 0.05; // Animation speed
    
    const animate = () => {
      if (count > path.length) return;
      
      const currentPath = path.slice(0, Math.ceil(count));
      
      // Interpolate the last point for smooth drawing
      if (count % 1 !== 0 && count < path.length) {
        const start = path[Math.floor(count)];
        const end = path[Math.ceil(count)];
        if (start && end) {
          const ratio = count % 1;
          const interpolated = {
            lat: start.lat + (end.lat - start.lat) * ratio,
            lng: start.lng + (end.lng - start.lng) * ratio
          };
          currentPath.push(interpolated);
        }
      }
      
      polyline.setPath(currentPath);
      
      count += speed;
      if (count <= path.length) {
        requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      polyline.setMap(null);
    };
  }, [map, path]);

  return null;
}

export default function ExpeditionMap({ expeditionId, lat, lng, path }: ExpeditionMapProps) {
  const [layers, setLayers] = useState({
    temp: true,
    wind: false,
    precip: false,
  });
  const [members, setMembers] = useState<Member[]>([]);

  // Sync members for map markers
  useEffect(() => {
    const db = getDb();
    if (!db) return;

    const membersRef = collection(db, 'expeditions', expeditionId, 'members');
    const q = query(membersRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Member[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Member));
      setMembers(list);
    });
    return () => unsubscribe();
  }, [expeditionId]);

  if (!hasValidKey) {
    return (
      <div className="w-full h-[500px] bg-slate-900 border border-slate-800 flex items-center justify-center rounded-xl overflow-hidden relative">
        <div className="text-center p-8 z-10 max-w-md">
          <MapPin size={48} className="mx-auto mb-4 text-orange-500 opacity-50" />
          <h3 className="text-xl font-bold mb-2">Google Maps Integration Required</h3>
          <p className="text-slate-400 text-sm mb-6">
            To view the live tactical map and weather overlays, please add your Google Maps Platform API Key to the project secrets as <code>GOOGLE_MAPS_PLATFORM_KEY</code>.
          </p>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest bg-black/40 p-3 rounded">
            Fallback Mode: Vector Grid Active
          </div>
        </div>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-slate-700) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-800 relative group">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={{ lat, lng }}
          center={{ lat, lng }}
          defaultZoom={13}
          mapId="EXPEDITION_TACTICAL_MAP"
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
        >
          {path && path.length > 0 && <RoutePolyline path={path} />}
          
          {/* Base Camp Marker */}
          <AdvancedMarker position={{ lat, lng }}>
            <Pin background="#f97316" glyphColor="#fff" borderColor="#c2410c" scale={1.2}>
              <div className="font-mono text-[8px] font-bold mt-1 text-orange-500">BASE_CAMP</div>
            </Pin>
          </AdvancedMarker>
          
          {/* Real-time Personnel Markers */}
          {members.map(member => (
            <AdvancedMarker key={member.id} position={{ lat: member.lat, lng: member.lng }}>
              <div className="relative group/marker">
                <div className={`p-1 rounded-full border-2 bg-black shadow-lg transition-transform hover:scale-110 ${
                  member.status === 'emergency' ? 'border-rose-500 animate-bounce' :
                  member.status === 'active' ? 'border-orange-500' : 'border-blue-400'
                }`}>
                  <User size={14} className={
                    member.status === 'emergency' ? 'text-rose-500' :
                    member.status === 'active' ? 'text-orange-500' : 'text-blue-400'
                  } />
                </div>
                {member.status === 'emergency' && (
                  <div className="absolute -inset-2 bg-rose-500/20 rounded-full animate-ping pointer-events-none" />
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-black/80 border border-slate-800 rounded whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className={`text-[8px] font-mono font-bold uppercase ${member.status === 'emergency' ? 'text-rose-500' : 'text-white'}`}>
                    {member.name} {member.status === 'emergency' ? '[SOS]' : ''}
                  </div>
                  <div className="text-[7px] font-mono text-slate-400">{Math.round(member.alt)}m ASL</div>
                </div>
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Dynamic Weather Overlay (Simulated) */}
      <AnimatePresence>
        {layers.temp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-blue-500 via-transparent to-orange-500 z-0" 
          />
        )}
      </AnimatePresence>

      {/* Weather Layer Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
        <LayerButton 
          active={layers.temp} 
          onClick={() => setLayers(l => ({ ...l, temp: !l.temp }))}
          icon={<Thermometer size={16} />}
          label="Temperature"
        />
        <LayerButton 
          active={layers.wind} 
          onClick={() => setLayers(l => ({ ...l, wind: !l.wind }))}
          icon={<Wind size={16} />}
          label="Wind Field"
        />
        <LayerButton 
          active={layers.precip} 
          onClick={() => setLayers(l => ({ ...l, precip: !l.precip }))}
          icon={<Cloud size={16} />}
          label="Precipitation"
        />
      </div>

      {/* Legend / Info */}
      <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md border border-slate-800 p-4 rounded-lg z-10">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Local Temp</div>
            <div className="text-xl font-bold text-orange-500">-12°C</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Wind Speed</div>
            <div className="text-xl font-bold text-blue-400">45 km/h</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Visibility</div>
            <div className="text-xl font-bold text-white">2.4 km</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayerButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-300 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md ${
        active 
          ? 'bg-orange-500/20 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
          : 'bg-black/60 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
