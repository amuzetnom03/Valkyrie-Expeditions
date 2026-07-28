import { Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { Expedition } from '@/types/expedition';

interface SidebarProps {
  expeditions: Expedition[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function Sidebar({ expeditions, selectedId, onSelect }: SidebarProps) {
  return (
    <>
      {/* Mobile Header / Navigation */}
      <div className="md:hidden flex flex-col w-full bg-[#0a0a0b] border-b border-slate-800 z-30">
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <div className="flex items-center gap-2 text-orange-500">
            <Activity size={20} className="animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold">Vanguard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-500">● LIVE</span>
          </div>
        </div>
        <div className="flex overflow-x-auto no-scrollbar py-2 px-2 gap-2">
          {expeditions.map((exp) => (
            <button
              key={exp.id}
              onClick={() => onSelect(exp.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all border flex-shrink-0 ${
                selectedId === exp.id 
                  ? 'border-orange-500 bg-orange-500/10 text-orange-500' 
                  : 'border-slate-800 text-slate-500 bg-slate-900/50'
              }`}
            >
              {exp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar Rail */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-20 lg:w-72 flex-shrink-0 border-r border-slate-800 bg-[#0a0a0b] z-20 flex flex-col hidden md:flex transition-all duration-500"
      >
        <div className="p-6 lg:p-8 border-b border-slate-800 flex flex-col items-center lg:items-start">
          <div className="flex items-center gap-3 text-orange-500 mb-2">
            <Activity size={24} className="animate-pulse flex-shrink-0" />
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold hidden lg:block">Vanguard Command</span>
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase text-slate-100 hidden lg:block">EXPEDITIONS</h2>
        </div>
        
        <div className="p-2 lg:p-4 flex-1 space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[2px] mb-4 pl-4 mt-4 hidden lg:block">
            Active Zones
          </div>
          <nav className="flex flex-col gap-2">
            {expeditions.map((exp) => (
              <button
                key={exp.id}
                onClick={() => onSelect(exp.id)}
                className={`text-left lg:px-6 py-4 transition-all duration-300 lg:border-l-4 flex flex-col lg:flex-row items-center lg:justify-between group relative rounded-lg lg:rounded-none ${
                  selectedId === exp.id 
                    ? 'lg:border-orange-500 bg-slate-900/50 text-white opacity-100 ring-1 ring-orange-500/30 lg:ring-0' 
                    : 'border-transparent text-slate-500 hover:bg-slate-900/30 hover:text-slate-300 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex flex-col items-center lg:items-start">
                  <div className={`text-[10px] font-mono mb-1 hidden lg:block ${selectedId === exp.id ? 'text-orange-500' : 'text-slate-600'}`}>
                    {exp.coords.split(',')[0]}
                  </div>
                  <div className="font-bold uppercase tracking-tight text-center lg:text-left text-[10px] lg:text-sm">
                    {exp.name.split(' ')[0]}
                    <span className="hidden lg:inline"> {exp.name.split(' ').slice(1).join(' ')}</span>
                  </div>
                </div>
                {selectedId === exp.id ? (
                  <motion.div layoutId="activeIndicator" className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)] mt-2 lg:mt-0" />
                ) : (
                  <div className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-slate-600 transition-colors mt-2 lg:mt-0" />
                )}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 lg:p-6 border-t border-slate-800 text-[8px] lg:text-[10px] font-mono text-slate-600">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="hidden lg:inline">SYS_STATE:</span>
              <span className="text-emerald-500">●<span className="hidden lg:inline ml-1">OPERATIONAL</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="hidden lg:inline">COMMS:</span>
              <span className="text-slate-400">●<span className="hidden lg:inline ml-1">ENCRYPTED</span></span>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
