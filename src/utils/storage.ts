import type { Config } from '../types';

const CONFIG_KEY = 'karakeep_config';
const PINNED_LISTS_KEY = 'pinned_lists';

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

  async getPinnedLists(): Promise<string[]> {
    const result = await chrome.storage.local.get(PINNED_LISTS_KEY);
    return result[PINNED_LISTS_KEY] || [];
  },

  async addPinnedList(listId: string): Promise<void> {
    const pinned = await this.getPinnedLists();
    if (!pinned.includes(listId)) {
      pinned.push(listId);
      await chrome.storage.local.set({ [PINNED_LISTS_KEY]: pinned });
    }
  },

  async removePinnedList(listId: string): Promise<void> {
    const pinned = await this.getPinnedLists();
    const filtered = pinned.filter(id => id !== listId);
    await chrome.storage.local.set({ [PINNED_LISTS_KEY]: filtered });
  },

  async isPinned(listId: string): Promise<boolean> {
    const pinned = await this.getPinnedLists();
    return pinned.includes(listId);
  },
};