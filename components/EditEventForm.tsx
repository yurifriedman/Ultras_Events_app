
import React, { useState, useEffect } from 'react';
import { EventData } from '../types';

interface EditEventFormProps {
  event: EventData;
  onSave: (updatedEvent: EventData) => void;
  onCancel: () => void;
}

const EditEventForm: React.FC<EditEventFormProps> = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState<EventData>({ ...event });

  useEffect(() => {
    setFormData({ ...event });
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="glass-card p-8 rounded-3xl animate-in fade-in zoom-in duration-300 border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center">
          <i className="fa-solid fa-pen-nib"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Edit Event Details</h2>
          <p className="text-slate-400 text-sm">Update the metadata for {event.title}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Event Name</label>
          <input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm text-slate-400 mb-1">Description</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Date</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Location</label>
            <input 
              type="text" 
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              placeholder="City, Country"
              required
            />
          </div>
        </div>
        
        <div className="flex gap-3 pt-6">
          <button 
            type="submit"
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-amber-500/20 active:scale-95"
          >
            Save Changes
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventForm;
