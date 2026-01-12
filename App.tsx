
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { EventData, Participant, SiteConfig } from './types';
import EventCard from './components/EventCard';
import RegistrationForm from './components/RegistrationForm';
import EditEventForm from './components/EditEventForm';
import Modal from './components/Modal';
import { cloudService } from './services/cloudService';
import { INITIAL_EVENTS, DEFAULT_SITE_CONFIG } from './constants';

const MY_REGS_KEY = 'ultras_my_registrations';

const App: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'register' | 'roster' | 'edit' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
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
          await cloudService.saveEvents(INITIAL_EVENTS);
          setEvents(INITIAL_EVENTS);
        } else {
          setEvents(filteredEvents);
        }

        setSiteConfig(configData);
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

  const handleSaveAllText = async () => {
    setIsSyncing(true);
    try {
      const configRes = await cloudService.saveSettings(siteConfig);
      const eventRes = await cloudService.saveEvents(events);
      
      if (configRes && eventRes) {
        setLastSync(new Date().toLocaleTimeString());
        setIsEditingText(false);
      } else {
        setLastSync(`Failed: ${new Date().toLocaleTimeString()}`);
      }
    } catch (e) {
      console.error("Sync Critical Error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Public portal link copied to clipboard!");
  };

  const updateConfig = (key: keyof SiteConfig, value: string) => {
    setSiteConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateEventInline = (id: string, field: 'title' | 'description', value: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
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

  const handleUpdateEvent = async (updatedEvent: EventData) => {
    const updatedEvents = events.map(evt => evt.id === updatedEvent.id ? updatedEvent : evt);
    setEvents(updatedEvents);
    setModalType(null);
    await syncToCloud(updatedEvents);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <i className="fa-solid fa-mountain-sun text-5xl mb-4 animate-bounce text-indigo-500"></i>
        <h1 className="text-2xl font-bold italic tracking-widest uppercase">Connecting to Cloud...</h1>
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
            {isEditingText ? (
              <input 
                value={siteConfig.brandName}
                onChange={(e) => updateConfig('brandName', e.target.value)}
                className="bg-slate-800 border-2 border-indigo-500 text-white rounded px-2 py-1 text-sm font-black uppercase italic outline-none w-32"
              />
            ) : (
              <span className="text-xl font-black tracking-tighter text-white uppercase italic">{siteConfig.brandName}</span>
            )}
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live Cloud Synced</span>
          </div>
        </div>
        <button 
          onClick={() => {
            setIsAdmin(!isAdmin);
            if (!isAdmin) setIsEditingText(false);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isAdmin ? 'bg-amber-500 text-slate-950 shadow-lg ring-4 ring-amber-500/20' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {isAdmin ? 'Admin Portal' : 'Guest View'}
        </button>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-6 mt-16 w-full space-y-16 pb-24">
        {/* Hero Section */}
        <section className="space-y-4">
          {isEditingText ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="relative">
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Main Headline</span>
                <input 
                  value={siteConfig.heroTitle}
                  onChange={(e) => updateConfig('heroTitle', e.target.value)}
                  className="w-full bg-slate-900/50 border-2 border-indigo-500 text-4xl md:text-6xl font-black text-white px-4 py-3 rounded-2xl outline-none"
                />
              </div>
              <div className="relative">
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Main Subtitle</span>
                <textarea 
                  value={siteConfig.heroSubtitle}
                  onChange={(e) => updateConfig('heroSubtitle', e.target.value)}
                  className="w-full bg-slate-900/50 border-2 border-indigo-500 text-slate-400 text-lg md:text-xl px-4 py-3 rounded-2xl outline-none resize-none"
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 tracking-tight">{siteConfig.heroTitle}</h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">{siteConfig.heroSubtitle}</p>
            </div>
          )}
        </section>

        {/* The Single Hike Card */}
        <section className="space-y-6">
          {hike1 && (
            <EventCard 
              event={hike1} 
              onRegisterClick={() => { setSelectedEventId('evt-1'); setModalType('register'); }}
              onViewRosterClick={() => { setSelectedEventId('evt-1'); setModalType('roster'); }}
              onEditClick={() => { setSelectedEventId('evt-1'); setModalType('edit'); }}
              onUpdateInline={updateEventInline}
              isAdmin={isAdmin}
              isEditingText={isEditingText}
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
              {isEditingText ? (
                <div className="space-y-4">
                  <input 
                    value={siteConfig.rosterTitle}
                    onChange={(e) => updateConfig('rosterTitle', e.target.value)}
                    className="block bg-slate-900 border-2 border-indigo-500 text-3xl font-black text-white px-4 py-2 rounded-2xl outline-none w-full"
                  />
                  <input 
                    value={siteConfig.rosterSubtitle}
                    onChange={(e) => updateConfig('rosterSubtitle', e.target.value)}
                    className="block bg-slate-900 border-2 border-indigo-500 text-slate-400 text-base px-4 py-2 rounded-2xl outline-none w-full"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">{siteConfig.rosterTitle}</h2>
                  <p className="text-slate-400 text-base italic">{siteConfig.rosterSubtitle} {hike1?.title || ''}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
              <i className="fa-solid fa-cookie-bite text-indigo-400 text-xs"></i>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recognizing {myRegistrationIds.length} Local ID(s)</span>
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
                  {(isMine || isAdmin) && (
                    <button 
                      onClick={() => handleCancelRegistration('evt-1', participant.id)}
                      className="text-red-500/50 hover:text-red-500 transition-all p-2"
                    >
                      <i className="fa-solid fa-circle-xmark text-lg"></i>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Admin Toolbar */}
      {isAdmin && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="glass-card p-6 rounded-[2rem] border-2 border-indigo-500/50 shadow-2xl min-w-[320px]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-globe text-amber-500"></i>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Public Portal Manager</span>
              </div>
              {isSyncing && <i className="fa-solid fa-sync fa-spin text-indigo-400"></i>}
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingText(!isEditingText)}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 border-2 ${
                    isEditingText 
                      ? 'bg-amber-500 text-slate-950 border-amber-400' 
                      : 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  <i className={`fa-solid ${isEditingText ? 'fa-times' : 'fa-edit'}`}></i>
                  {isEditingText ? 'Exit' : 'Edit UI'}
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-white/5 transition-all"
                  title="Copy Public Link"
                >
                  <i className="fa-solid fa-share-nodes"></i>
                </button>
              </div>

              {isEditingText && (
                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="bg-slate-950/50 p-4 rounded-2xl space-y-3 border border-white/5">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Interactive Elements</p>
                    <input 
                      value={siteConfig.registerButtonText} 
                      onChange={(e) => updateConfig('registerButtonText', e.target.value)}
                      className="w-full bg-slate-900 text-white text-xs p-3 rounded-xl border border-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                    <input 
                      value={siteConfig.viewRosterButtonText} 
                      onChange={(e) => updateConfig('viewRosterButtonText', e.target.value)}
                      className="w-full bg-slate-900 text-white text-xs p-3 rounded-xl border border-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleSaveAllText}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i> Publish Changes
                  </button>
                </div>
              )}

              <div className="text-center pt-2 text-[8px] text-slate-600 font-bold uppercase">
                Last Global Sync: {lastSync || 'Active'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={modalType === 'register'} onClose={() => setModalType(null)} title="Public Registration">
        {hike1 && <RegistrationForm eventTitle={hike1.title} onRegister={handleRegister} onCancel={() => setModalType(null)} />}
      </Modal>
      <Modal isOpen={modalType === 'roster'} onClose={() => setModalType(null)} title={`Roster: ${hike1?.title}`}>
        <div className="space-y-4">
          {hike1?.registrations.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{p.name} {myRegistrationIds.includes(p.id) ? '(Local ID Verified ✓)' : ''}</p>
                <p className="text-xs text-slate-500">{p.phone}</p>
              </div>
              {(isAdmin || myRegistrationIds.includes(p.id)) && (
                <button onClick={() => handleCancelRegistration('evt-1', p.id)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider">Cancel Entry</button>
              )}
            </div>
          ))}
          {hike1?.registrations.length === 0 && <p className="text-center text-slate-500 py-4">No public entries yet.</p>}
        </div>
      </Modal>
      <Modal isOpen={modalType === 'edit'} onClose={() => setModalType(null)} title="Cloud Metadata">
        {hike1 && <EditEventForm event={hike1} onSave={handleUpdateEvent} onCancel={() => setModalType(null)} />}
      </Modal>
    </div>
  );
};

export default App;
