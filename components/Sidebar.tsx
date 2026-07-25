import { ActivityIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Expedition } from '@/types/expedition';

interface SidebarProps {
  expeditions: Expedition[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function Sidebar({ expeditions, selectedId, onSelect }: SidebarProps) {
  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-72 flex-shrink-0 border-r border-slate-800 bg-[#0a0a0b] z-20 flex flex-col hidden md:flex"
    >
      <div className="p-8 border-b border-slate-800">
        <div className="flex items-center gap-3 text-orange-500 mb-2">
          <ActivityIcon size={24} className="animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">Vanguard Command</span>
        </div>
        <h2 className="text-xl font-black tracking-tighter uppercase text-slate-100">EXPEDITIONS</h2>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-1">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[2px] mb-4 pl-4 mt-4">
          Active Zones (Himalaya)
        </div>
        <nav className="flex flex-col gap-1">
          {expeditions.map((exp) => (
            <button
              key={exp.id}
              onClick={() => onSelect(exp.id)}
              className={`text-left px-6 py-4 font-mono text-sm uppercase tracking-wider transition-all duration-300 border-l-4 flex items-center justify-between group ${
                selectedId === exp.id 
                  ? 'border-orange-500 bg-slate-900/50 text-white opacity-100' 
                  : 'border-transparent text-slate-500 hover:bg-slate-900/30 hover:text-slate-300 opacity-60 hover:opacity-100'
              }`}
            >
              <div>
                <div className={`text-[10px] font-mono mb-1 ${selectedId === exp.id ? 'text-orange-500' : 'text-slate-600'}`}>
                  {exp.coords.split(',')[0]}
                </div>
                <div className="font-bold uppercase tracking-tight">{exp.name}</div>
              </div>
              {selectedId === exp.id ? (
                <motion.div layoutId="activeIndicator" className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-slate-600 transition-colors" />
              )}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-6 border-t border-slate-800 text-[10px] font-mono text-slate-600">
        <div className="flex justify-between items-center mb-2">
          <span>SYS_STATE:</span>
          <span className="text-emerald-500">OPERATIONAL</span>
        </div>
        <div className="flex justify-between items-center">
          <span>COMMS_LINK:</span>
          <span className="text-slate-400">ENCRYPTED_SAT</span>
        </div>
      </div>
    </motion.aside>
  );
}
