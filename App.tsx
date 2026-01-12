
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { EventData, Participant, SiteConfig } from './types';
import EventCard from './components/EventCard';
import RegistrationForm from './components/RegistrationForm';
import Modal from './components/Modal';
import { cloudService } from './services/cloudService';
import { INITIAL_EVENTS, DEFAULT_SITE_CONFIG } from './constants';

const MY_REGS_KEY = 'ultras_my_registrations';

const App: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [modalType, setModalType] = useState<'register' | 'roster' | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  
  const [myRegistrationIds, setMyRegistrationIds] = useState<string[]>([]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initApp = async () => {
      try {
        const [eventsData, configData] = await Promise.all([
          cloudService.fetchEvents(),
          cloudService.fetchSettings()
        ]);
        
        // STRICT: Only keep Hike 1 (evt-1)
        const filteredEvents = eventsData.filter(e => e.id === 'evt-1');
        
        if (filteredEvents.length === 0) {
          // If Hike 1 is missing, seed it
          await cloudService.saveEvents(INITIAL_EVENTS);
          setEvents(INITIAL_EVENTS);
        } else {
          setEvents(filteredEvents);
        }

        setSiteConfig(configData || DEFAULT_SITE_CONFIG);
        setLastSync(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setIsInitialLoading(false);
      }

      const storedIds = localStorage.getItem(MY_REGS_KEY);
      if (storedIds) {
        setMyRegistrationIds(JSON.parse(storedIds));
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    localStorage.setItem(MY_REGS_KEY, JSON.stringify(myRegistrationIds));
  }, [myRegistrationIds]);

  const hike1 = useMemo(() => events.find(e => e.id === 'evt-1'), [events]);

  const syncToCloud = async (updatedEvents: EventData[]) => {
    setIsSyncing(true);
    const hikeOnly = updatedEvents.filter(e => e.id === 'evt-1');
    const success = await cloudService.saveEvents(hikeOnly);
    if (success) {
      setLastSync(new Date().toLocaleTimeString());
    }
    setIsSyncing(false);
  };

  const handleRegister = async (name: string, phone: string) => {
    if (!hike1) return;
    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      name,
      phone,
      registeredAt: new Date().toISOString().split('T')[0]
    };
    const updatedEvents = events.map(evt => 
      evt.id === hike1.id ? { ...evt, registrations: [...evt.registrations, newParticipant] } : evt
    );
    setEvents(updatedEvents);
    setMyRegistrationIds(prev => [...prev, newParticipant.id]);
    setModalType(null);
    await syncToCloud(updatedEvents);
  };

  const handleCancelRegistration = async (eventId: string, participantId: string) => {
    const updatedEvents = events.map(evt => {
      if (evt.id === eventId) {
        return { ...evt, registrations: evt.registrations.filter(p => p.id !== participantId) };
      }
      return evt;
    });
    setEvents(updatedEvents);
    setMyRegistrationIds(prev => prev.filter(id => id !== participantId));
    await syncToCloud(updatedEvents);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <i className="fa-solid fa-mountain-sun text-5xl mb-4 animate-bounce text-indigo-500"></i>
        <h1 className="text-2xl font-bold italic tracking-widest uppercase">Connecting to Portal...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-mountain text-white"></i>
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">{siteConfig.brandName}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
           {isSyncing ? (
             <span className="flex items-center gap-2"><i className="fa-solid fa-sync fa-spin"></i> Saving...</span>
           ) : (
             <span>Synced: {lastSync}</span>
           )}
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-6 mt-16 w-full space-y-16 pb-24">
        {/* Hero Section */}
        <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 tracking-tight">{siteConfig.heroTitle}</h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">{siteConfig.heroSubtitle}</p>
        </section>

        {/* The Single Hike Card */}
        <section className="space-y-6">
          {hike1 && (
            <EventCard 
              event={hike1} 
              onRegisterClick={() => setModalType('register')}
              onViewRosterClick={() => setModalType('roster')}
              customRegisterLabel={siteConfig.registerButtonText}
              customRosterLabel={siteConfig.viewRosterButtonText}
            />
          )}
        </section>
      </main>

      {/* Roster Section */}
      <section className="border-t border-white/5 bg-slate-900/40 backdrop-blur-xl py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center border border-green-500/20 mb-6">
                <i className="fa-solid fa-users-line text-xl"></i>
              </div>
              <h2 className="text-3xl font-black text-white mb-2">{siteConfig.rosterTitle}</h2>
              <p className="text-slate-400 text-base italic">{siteConfig.rosterSubtitle} {hike1?.title || ''}</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
              <i className="fa-solid fa-id-badge text-indigo-400 text-xs"></i>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recognizing {myRegistrationIds.length} Registration(s)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {hike1?.registrations.map(participant => {
              const isMine = myRegistrationIds.includes(participant.id);
              return (
                <div key={participant.id} className={`p-5 rounded-3xl glass-card flex items-center gap-4 border-2 transition-all ${isMine ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-white/5'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${isMine ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {participant.name.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-slate-200 font-black truncate">{participant.name} {isMine && '✓'}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">{participant.registeredAt}</p>
                  </div>
                  {isMine && (
                    <button 
                      onClick={() => handleCancelRegistration('evt-1', participant.id)}
                      className="text-red-500/50 hover:text-red-500 transition-all p-2"
                      title="Cancel your registration"
                    >
                      <i className="fa-solid fa-circle-xmark text-lg"></i>
                    </button>
                  )}
                </div>
              );
            })}
            {(!hike1 || hike1.registrations.length === 0) && (
               <div className="col-span-full py-12 text-center text-slate-500 italic">No registrations found for this hike.</div>
            )}
          </div>
        </div>
      </section>

      {/* Modals */}
      <Modal isOpen={modalType === 'register'} onClose={() => setModalType(null)} title="Public Registration">
        {hike1 && <RegistrationForm eventTitle={hike1.title} onRegister={handleRegister} onCancel={() => setModalType(null)} />}
      </Modal>
      <Modal isOpen={modalType === 'roster'} onClose={() => setModalType(null)} title={`Roster: ${hike1?.title}`}>
        <div className="space-y-4">
          {hike1?.registrations.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{p.name} {myRegistrationIds.includes(p.id) ? '(Verified ✓)' : ''}</p>
                <p className="text-xs text-slate-500">{p.phone}</p>
              </div>
              {myRegistrationIds.includes(p.id) && (
                <button onClick={() => handleCancelRegistration('evt-1', p.id)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider">Cancel My Entry</button>
              )}
            </div>
          ))}
          {hike1?.registrations.length === 0 && <p className="text-center text-slate-500 py-4">No public entries yet.</p>}
        </div>
      </Modal>
    </div>
  );
};

export default App;
