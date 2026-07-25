'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Activity, Navigation, ShieldAlert, Zap } from 'lucide-react';
import { getDb, getAuthClient } from '@/lib/firebase';
import { collection, onSnapshot, query, setDoc, doc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export interface Member {
  id: string;
  name: string;
  role: string;
  lat: number;
  lng: number;
  alt: number;
  speed: number;
  hr: number;
  battery: number;
  status: 'active' | 'resting' | 'stationary' | 'emergency';
}

const MOCK_MEMBERS: Member[] = [
  { id: '1', name: 'S. Anderson', role: 'Lead Guide', lat: 35.8813, lng: 76.5133, alt: 5150, speed: 1.2, hr: 142, battery: 88, status: 'active' },
  { id: '2', name: 'J. Miller', role: 'Expedition Doc', lat: 35.8815, lng: 76.5130, alt: 5148, speed: 0.8, hr: 128, battery: 92, status: 'active' },
  { id: '3', name: 'T. Chen', role: 'Logistics', lat: 35.8810, lng: 76.5135, alt: 5152, speed: 0, hr: 82, battery: 45, status: 'resting' },
];

interface TrackingPanelProps {
  expeditionId: string;
  onEmergency?: () => void;
}

export default function TrackingPanel({ expeditionId, onEmergency }: TrackingPanelProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Auth sync
  useEffect(() => {
    const auth = getAuthClient();
    if (!auth) return;
    return onAuthStateChanged(auth, setCurrentUser);
  }, []);

  // Sync with Firestore
  useEffect(() => {
    const db = getDb();
    if (!db) return;

    const membersRef = collection(db, 'expeditions', expeditionId, 'members');
    const qMembers = query(membersRef);

    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      const memberList: Member[] = [];
      snapshot.forEach((doc) => {
        memberList.push({ id: doc.id, ...doc.data() } as Member);
      });

      if (memberList.length === 0 && loading) {
        MOCK_MEMBERS.forEach(async (member) => {
          await setDoc(doc(db, 'expeditions', expeditionId, 'members', member.id), {
            ...member,
            updatedAt: Timestamp.now()
          });
        });
      }

      setMembers(memberList);
      setLoading(false);
    });

    const alertsRef = collection(db, 'expeditions', expeditionId, 'alerts');
    const qAlerts = query(alertsRef, orderBy('timestamp', 'desc'), limit(5));
    const unsubAlerts = onSnapshot(qAlerts, (snapshot) => {
      const alertList: any[] = [];
      snapshot.forEach(doc => alertList.push({ id: doc.id, ...doc.data() }));
      setAlerts(alertList);
    });

    return () => {
      unsubMembers();
      unsubAlerts();
    };
  }, [expeditionId, loading]);

  // Movement Simulation (Local for UI demo)
  useEffect(() => {
    const interval = setInterval(async () => {
      const db = getDb();
      if (members.length === 0 || !db) return;
      
      // We only simulate updates for the first member to show live behavior
      const m = members[0];
      if (m && m.status !== 'resting') {
        const memberRef = doc(db, 'expeditions', expeditionId, 'members', m.id);
        await setDoc(memberRef, {
          ...m,
          lat: m.lat + (Math.random() - 0.5) * 0.0001,
          lng: m.lng + (Math.random() - 0.5) * 0.0001,
          alt: m.alt + (Math.random() - 0.5) * 2,
          hr: Math.floor(130 + Math.random() * 20),
          speed: Math.max(0.5, m.speed + (Math.random() - 0.5) * 0.1),
          updatedAt: Timestamp.now()
        }, { merge: true });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [members, expeditionId]);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[400px]">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-orange-500" />
          <h3 className="font-bold text-lg uppercase tracking-tight">Personnel Telemetry</h3>
        </div>
        <div className="flex items-center gap-2">
          {loading && <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />}
          <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-mono text-[10px] border border-emerald-500/20">
            LIVE FEED
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {/* Active Emergency Alerts */}
        <AnimatePresence>
          {alerts.map(alert => (
            <motion.div 
              key={alert.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-500/10 border-b border-rose-500/20 p-4 flex items-center gap-4"
            >
              <div className="bg-rose-500 p-2 rounded-lg animate-pulse">
                <Zap size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono font-black text-rose-500 uppercase tracking-widest">Emergency: {alert.type}</span>
                  <span className="text-[10px] font-mono text-slate-500">{new Date(alert.timestamp.seconds * 1000).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs font-bold text-white">{alert.userName} - DISTRESS SIGNAL</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {members.map((member) => (
          <motion.div 
            key={member.id} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`p-6 hover:bg-slate-800/30 transition-colors group relative ${member.status === 'emergency' ? 'bg-rose-950/20' : ''}`}
          >
            {member.status === 'emergency' && (
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 shadow-[2px_0_10px_rgba(244,63,94,0.4)]" />
            )}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  member.status === 'active' ? 'bg-orange-500/10 text-orange-500' : 
                  member.status === 'emergency' ? 'bg-rose-500/10 text-rose-500 animate-pulse' :
                  member.status === 'resting' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700/50 text-slate-400'
                }`}>
                  <User size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-100">{member.name} {member.id === currentUser?.uid && <span className="text-[10px] text-orange-500 ml-1">(YOU)</span>}</div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{member.role}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black font-mono text-white leading-none tracking-tight">
                  {Math.round(member.alt)}m
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Elevation</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <TelemetryValue label="V-Speed" value={`${member.speed.toFixed(1)} km/h`} icon={<Navigation size={12} className="rotate-45" />} />
              <TelemetryValue label="Heart Rate" value={`${member.hr} BPM`} icon={<Activity size={12} />} color="text-rose-500" />
              <TelemetryValue label="Battery" value={`${member.battery}%`} icon={<div className="w-3 h-1.5 border border-current rounded-sm relative after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:w-0.5 after:h-0.5 after:bg-current" />} />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-500">
                POS: {member.lat.toFixed(4)}, {member.lng.toFixed(4)}
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest ${
                member.status === 'emergency' ? 'text-rose-500 font-black' :
                member.status === 'active' ? 'text-orange-500' : 'text-slate-500'
              }`}>
                <div className={`w-1 h-1 rounded-full ${member.status === 'emergency' ? 'animate-ping bg-rose-500' : 'animate-pulse bg-current'}`} />
                {member.status}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 bg-black/20 space-y-4">
        {currentUser && (
          <button 
            onClick={onEmergency}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-sm rounded-lg shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 group"
          >
            <ShieldAlert size={20} className="group-hover:animate-bounce" />
            Emergency Heli-Evac
          </button>
        )}
        <div className="text-center">
          <button className="text-[10px] font-mono text-slate-500 hover:text-white transition-colors uppercase tracking-[2px]">
            View Full Personnel Roster
          </button>
        </div>
      </div>
    </div>
  );
}

function TelemetryValue({ label, value, icon, color = "text-slate-100" }: { label: string, value: string, icon: React.ReactNode, color?: string }) {
  return (
    <div className="bg-black/30 p-2 rounded border border-slate-800/50">
      <div className="text-[8px] font-mono text-slate-500 uppercase mb-1 flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className={`text-xs font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}
