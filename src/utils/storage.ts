import type { Config } from '../types';

const CONFIG_KEY = 'karakeep_config';

export const storage = {
  async getConfig(): Promise<Config | null> {
    const result = await chrome.storage.local.get(CONFIG_KEY);
    return result[CONFIG_KEY] || null;
  },

  async setConfig(config: Config): Promise<void> {
    await chrome.storage.local.set({ [CONFIG_KEY]: config });
  },

  async clearConfig(): Promise<void> {
    await chrome.storage.local.remove(CONFIG_KEY);
  },
};