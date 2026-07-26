'use client';

import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import { Shield, User, Phone, Droplets, HeartPulse, FileText, CheckCircle2, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { TravelerInfo } from '@/types/expedition';
import { useState, useEffect } from 'react';
import { googleSignIn, initAuth } from '@/lib/google-auth';
import { User as FirebaseUser } from 'firebase/auth';

interface MissionFormProps {
  onCancel: () => void;
  onSubmit: (data: TravelerInfo) => void;
  expeditionName: string;
}

export default function MissionForm({ onCancel, onSubmit, expeditionName }: MissionFormProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setUser(user);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<TravelerInfo>({
    defaultValues: {
      gearCheck: false,
    }
  });

  const handleAuth = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Auth failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const onFormSubmit = (data: TravelerInfo) => {
    if (needsAuth) {
      handleAuth();
      return;
    }
    onSubmit(data);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto p-8 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <div className="text-[10px] font-mono text-orange-500 uppercase tracking-[3px] mb-1">Onboarding Protocol</div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">MISSION_INITIALIZATION</h2>
          <div className="text-xs font-mono text-slate-500 mt-1 uppercase">ASSIGNMENT: {expeditionName}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personnel Details */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> Personnel Information
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase ml-1">Full Legal Name</label>
              <input 
                {...register('fullName', { required: true })}
                className="w-full bg-black/40 border border-slate-800 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Ex: Alexander Vanguard"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase ml-1">Passport Number</label>
              <input 
                {...register('passportNumber', { required: true })}
                className="w-full bg-black/40 border border-slate-800 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="A12345678"
              />
            </div>
          </section>

          {/* Mission Timing & Calendar */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CalendarIcon size={12} /> Mission Schedule
            </h3>
            
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase ml-1">Start Date</label>
                <input 
                  type="date"
                  {...register('startDate', { required: true })}
                  className="w-full bg-black/40 border border-slate-800 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase ml-1">End Date</label>
                <input 
                  type="date"
                  {...register('endDate', { required: true })}
                  className="w-full bg-black/40 border border-slate-800 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-[10px] text-blue-400 leading-tight">
                Dates will be synced to your Google Calendar to facilitate logistical coordination and vehicle allocation.
              </p>
            </div>
          </section>

          {/* Medical & Emergency */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <HeartPulse size={12} /> Medical / Emergency
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase ml-1 text-rose-500">Emergency Contact (Phone)</label>
              <input 
                {...register('emergencyContact', { required: true })}
                className="w-full bg-black/40 border border-slate-800 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="+92 3XX XXXXXXX"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase ml-1">Blood Group</label>
                <select 
                  {...register('bloodGroup', { required: true })}
                  className="w-full bg-black/40 border border-slate-800 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors appearance-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="AB+">AB+</option>
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase ml-1">Insurance ID</label>
                <input 
                  {...register('insurancePolicy', { required: true })}
                  className="w-full bg-black/40 border border-slate-800 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                  placeholder="POL-9912"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase ml-1">Medical Conditions / Allergies</label>
          <textarea 
            {...register('medicalConditions')}
            className="w-full bg-black/40 border border-slate-800 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors h-24 resize-none"
            placeholder="N/A or list conditions..."
          />
        </div>

        <div className="bg-black/40 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="text-orange-500" size={20} />
            <h4 className="font-bold uppercase tracking-tight text-white">Final Mission Readiness</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            By initializing this protocol, you confirm that all gear has been verified against the Vanguard Expedition Manifest and you are medically cleared for high-altitude glacial environments.
          </p>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              {...register('gearCheck', { required: true })}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 checked:bg-orange-500 transition-colors"
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">I confirm all gear is mission-ready</span>
          </label>
        </div>

        {needsAuth ? (
          <button 
            type="button"
            onClick={handleAuth}
            disabled={isLoggingIn}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[5px] rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <CalendarIcon size={24} />
            {isLoggingIn ? 'CONNECTING...' : 'CONNECT GOOGLE CALENDAR'}
          </button>
        ) : (
          <button 
            type="submit"
            className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-[5px] rounded-xl shadow-[0_0_30px_rgba(234,88,12,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <CheckCircle2 size={24} />
            EXECUTE MISSION PROTOCOL
          </button>
        )}
      </form>
    </motion.div>
  );
}
