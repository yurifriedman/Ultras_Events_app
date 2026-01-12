
import { createClient } from '@supabase/supabase-js';
import { EventData, SiteConfig } from '../types';
import { INITIAL_EVENTS, DEFAULT_SITE_CONFIG } from '../constants';

const SUPABASE_URL = 'https://yohvcvietvwrylpswtsy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qps4iUawf9KcYoNlagOwJA_JpTL3mPL';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const cloudService = {
  async fetchEvents(): Promise<EventData[]> {
    try {
      const { data, error } = await supabase
        .from('hikes')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.warn("Supabase Fetch Warn:", error.message);
        return INITIAL_EVENTS;
      }

      if (!data || data.length === 0) {
        return INITIAL_EVENTS;
      }

      return data as EventData[];
    } catch (e) {
      console.error("Cloud Error:", e);
      return INITIAL_EVENTS;
    }
  },

  async saveEvents(events: EventData[]): Promise<boolean> {
    if (!events || events.length === 0) return true;

    try {
      // De-duplicate locally before sending
      const uniqueEvents = Array.from(new Map(events.map(item => [item.id, item])).values());
      
      const { error } = await supabase
        .from('hikes')
        .upsert(uniqueEvents, { onConflict: 'id' });

      if (error) {
        console.error("Supabase Save Events Error:", error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Events Sync Failed", e);
      return false;
    }
  },

  async fetchSettings(): Promise<SiteConfig> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('config')
        .eq('id', 'site_config')
        .single();

      if (error) {
        console.warn("Supabase Settings fetch error:", error.message);
        return DEFAULT_SITE_CONFIG;
      }
      return (data.config as SiteConfig) || DEFAULT_SITE_CONFIG;
    } catch {
      return DEFAULT_SITE_CONFIG;
    }
  },

  async saveSettings(config: SiteConfig): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 'site_config', config }, { onConflict: 'id' });
      
      if (error) {
        console.error("Supabase Save Settings Error:", error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Settings Sync Failed", e);
      return false;
    }
  }
};
