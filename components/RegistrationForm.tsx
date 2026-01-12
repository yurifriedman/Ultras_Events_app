
import React, { useState } from 'react';

interface RegistrationFormProps {
  eventTitle: string;
  onRegister: (name: string, phone: string) => void;
  onCancel: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ eventTitle, onRegister, onCancel }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) {
      onRegister(name, phone);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <p className="text-indigo-400 mb-6 font-medium text-lg">Hiking in: {eventTitle}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1 font-medium">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1 font-medium">Phone Number</label>
          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="+1 (555) 000-0000"
            required
          />
        </div>
        
        <div className="flex gap-3 pt-6">
          <button 
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            Confirm Registration
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
