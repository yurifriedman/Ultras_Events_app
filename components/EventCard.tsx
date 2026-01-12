
import React from 'react';
import { EventData } from '../types';

interface EventCardProps {
  event: EventData;
  onRegisterClick: (id: string) => void;
  onViewRosterClick: (id: string) => void;
  onEditClick?: (id: string) => void;
  onUpdateInline?: (id: string, field: 'title' | 'description', value: string) => void;
  isAdmin?: boolean;
  isEditingText?: boolean;
  customRegisterLabel?: string;
  customRosterLabel?: string;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onRegisterClick, 
  onViewRosterClick,
  onEditClick,
  onUpdateInline,
  isAdmin,
  isEditingText,
  customRegisterLabel,
  customRosterLabel
}) => {
  return (
    <div className="glass-card p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] border-l-4 border-l-indigo-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center text-indigo-400">
           <i className="fa-solid fa-mountain-sun mr-2"></i>
           <span className="text-xs font-bold uppercase tracking-widest">Ultra Hike</span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && onEditClick && !isEditingText && (
            <button 
              onClick={() => onEditClick(event.id)}
              className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center border border-amber-500/20"
              title="Edit Event Details"
            >
              <i className="fa-solid fa-pen-to-square text-xs"></i>
            </button>
          )}
          <div className="flex items-center text-slate-400 text-sm">
            <i className="fa-solid fa-users mr-2"></i>
            <span>{event.registrations.length}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          {isEditingText && onUpdateInline ? (
            <div className="space-y-2 mb-4">
              <input 
                value={event.title}
                onChange={(e) => onUpdateInline(event.id, 'title', e.target.value)}
                className="w-full bg-slate-900 border border-indigo-500 text-2xl font-bold text-white px-2 py-1 rounded"
              />
              <textarea 
                value={event.description}
                onChange={(e) => onUpdateInline(event.id, 'description', e.target.value)}
                className="w-full bg-slate-900 border border-indigo-500 text-slate-400 text-sm px-2 py-1 rounded resize-none"
                rows={2}
              />
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2 max-w-2xl">{event.description}</p>
            </>
          )}
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center text-slate-300 text-sm">
              <i className="fa-regular fa-calendar-days w-5 text-indigo-400"></i>
              <span>{event.date}</span>
            </div>
            <div className="flex items-center text-slate-300 text-sm">
              <i className="fa-solid fa-location-dot w-5 text-indigo-400"></i>
              <span>{event.location}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 min-w-[300px]">
          <button 
            onClick={() => onViewRosterClick(event.id)}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-list-ul"></i>
            {customRosterLabel || 'View Roster'}
          </button>
          <button 
            onClick={() => onRegisterClick(event.id)}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-pen-to-square"></i>
            {customRegisterLabel || 'Register to Hike'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
