
import React from 'react';
import { EventData } from '../types';

interface EventCardProps {
  event: EventData;
  onRegisterClick: (id: string) => void;
  onViewRosterClick: (id: string) => void;
  customRegisterLabel?: string;
  customRosterLabel?: string;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onRegisterClick, 
  onViewRosterClick,
  customRegisterLabel,
  customRosterLabel
}) => {
  return (
    <div className="glass-card p-6 md:p-10 rounded-[2.5rem] transition-all duration-500 hover:shadow-[0_0_50px_rgba(99,102,241,0.1)] border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 group-hover:w-3 transition-all"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center text-indigo-400">
           <i className="fa-solid fa-mountain-sun mr-3 text-xl"></i>
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Trail Event</span>
        </div>
        <div className="flex items-center text-slate-400 text-sm font-bold bg-white/5 px-4 py-1 rounded-full">
          <i className="fa-solid fa-users mr-2 text-indigo-400"></i>
          <span>{event.registrations.length} Participants</span>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{event.title}</h3>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">{event.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center text-slate-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mr-4">
                <i className="fa-regular fa-calendar-days text-indigo-400"></i>
              </div>
              <div>
                <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Scheduled Date</p>
                <p className="font-bold text-sm">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center text-slate-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mr-4">
                <i className="fa-solid fa-location-dot text-indigo-400"></i>
              </div>
              <div>
                <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Base Location</p>
                <p className="font-bold text-sm">{event.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[280px]">
          <button 
            onClick={() => onRegisterClick(event.id)}
            className="flex-1 px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-95"
          >
            <i className="fa-solid fa-id-card"></i>
            {customRegisterLabel || 'Register Now'}
          </button>
          <button 
            onClick={() => onViewRosterClick(event.id)}
            className="flex-1 px-8 py-5 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-3 active:scale-95"
          >
            <i className="fa-solid fa-users-viewfinder"></i>
            {customRosterLabel || 'View Roster'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
