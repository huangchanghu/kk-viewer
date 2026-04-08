import { create } from 'zustand';
import type { Config, ZBookmarkList, Bookmark, NavItem } from '../types';
import { storage } from '../utils/storage';
import { KarakeepClient } from '../api/karakeep';

interface AppState {
  // Config
  config: Config | null;
  configLoading: boolean;
  isEditingConfig: boolean;
  loadConfig: () => Promise<void>;
  setConfig: (config: Config) => Promise<boolean>;
  clearConfig: () => Promise<void>;
  startEditConfig: () => void;
  cancelEditConfig: () => void;

  // Pinned Lists
  pinnedLists: string[];
  loadPinnedLists: () => Promise<void>;
  pinList: (listId: string) => Promise<void>;
  unpinList: (listId: string) => Promise<void>;
  isPinned: (listId: string) => boolean;

  // Navigation
  currentPath: NavItem[];
  buildPathForList: (listId: string) => NavItem[];
  navigateTo: (item: NavItem | null) => void;
  navigateBack: () => void;

  // Data
  allLists: ZBookmarkList[];
  currentListId: string | null;
  bookmarks: Bookmark[];
  cursor: string | null;
  hasMore: boolean;

  // Search
  searchQuery: string;
  searchResults: Bookmark[];
  searchCursor: string | null;
  hasMoreSearch: boolean;

  // UI State
  loading: boolean;
  error: string | null;
  isSearchMode: boolean;

  // Actions
  loadLists: () => Promise<void>;
  loadBookmarks: (listId: string, newCursor?: string) => Promise<void>;
  search: (query: string, newCursor?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  loadMoreSearch: () => Promise<void>;
  clearError: () => void;
  resetSearch: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Config
  config: null,
  configLoading: true,
  isEditingConfig: false,

  // Pinned Lists
  pinnedLists: [],

  loadConfig: async () => {
    set({ configLoading: true });
    const config = await storage.getConfig();
    const pinnedLists = await storage.getPinnedLists();
    set({ config, configLoading: false, pinnedLists });
  },

  setConfig: async (config: Config) => {
    const client = new KarakeepClient(config);
    const valid = await client.testConnection();
    if (!valid) {
      return false;
    }
    await storage.setConfig(config);
    set({ config, isEditingConfig: false });
    return true;
  },

  clearConfig: async () => {
    await storage.clearConfig();
    set({
      config: null,
      allLists: [],
      bookmarks: [],
      currentPath: [],
      currentListId: null,
      pinnedLists: [],
    });
  },

  startEditConfig: () => set({ isEditingConfig: true }),

  cancelEditConfig: () => set({ isEditingConfig: false }),

  // Pinned Lists
  loadPinnedLists: async () => {
    const pinnedLists = await storage.getPinnedLists();
    set({ pinnedLists });
  },

  pinList: async (listId: string) => {
    await storage.addPinnedList(listId);
    const pinnedLists = await storage.getPinnedLists();
    set({ pinnedLists });
  },

  unpinList: async (listId: string) => {
    await storage.removePinnedList(listId);
    const pinnedLists = await storage.getPinnedLists();
    set({ pinnedLists });
  },

  isPinned: (listId: string) => {
    return get().pinnedLists.includes(listId);
  },

  // Navigation
  currentPath: [],

  // Build full path for a list based on its parentId hierarchy
  buildPathForList: (listId: string): NavItem[] => {
    const { allLists } = get();
    const path: NavItem[] = [];
    let currentId: string | null = listId;

    while (currentId) {
      const list = allLists.find(l => l.id === currentId);
      if (list) {
        path.unshift({ id: list.id, name: list.name, icon: list.icon });
        currentId = list.parentId;
      } else {
        break;
      }
    }

    return path;
  },

  navigateTo: (item: NavItem | null) => {
    if (item === null) {
      // Navigate to root - no bookmarks needed on root page
      set({
        currentPath: [],
        currentListId: null,
        isSearchMode: false,
        bookmarks: [],
        cursor: null,
        hasMore: false,
      });
    } else if (!item.id) {
      // item.id is null, navigate to root
      set({
        currentPath: [],
        currentListId: null,
        isSearchMode: false,
        bookmarks: [],
        cursor: null,
        hasMore: false,
      });
    } else {
      // Build full path based on list hierarchy
      const fullPath = get().buildPathForList(item.id);
      // Navigate to the target path - always update currentPath from fullPath
      set({
        currentPath: fullPath,
        currentListId: item.id,
        isSearchMode: false,
        bookmarks: [],
        cursor: null,
        hasMore: false,
      });
      // Load bookmarks for this list (item.id is guaranteed to be string in this branch)
      if (item.id) {
        get().loadBookmarks(item.id);
      }
    }
  },

  navigateBack: () => {
    const state = get();
    const newPath = state.currentPath.slice(0, -1);
    const lastItem = newPath[newPath.length - 1];
    set({
      currentPath: newPath,
      currentListId: lastItem?.id || null,
      isSearchMode: false,
      bookmarks: [],
      cursor: null,
      hasMore: false,
    });
    // Load bookmarks if navigating to a list (not root)
    if (lastItem?.id) {
      get().loadBookmarks(lastItem.id);
    }
  },

  // Data
  allLists: [],
  currentListId: null,
  bookmarks: [],
  cursor: null,
  hasMore: false,

  // Search
  searchQuery: '',
  searchResults: [],
  searchCursor: null,
  hasMoreSearch: false,

  // UI State
  loading: false,
  error: null,
  isSearchMode: false,

  loadLists: async () => {
    const { config } = get();
    if (!config) return;

    set({ loading: true, error: null });
    try {
      const client = new KarakeepClient(config);
      const response = await client.getLists();
      set({ allLists: response.lists, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '加载列表失败',
        loading: false,
      });
    }
  },

  loadBookmarks: async (listId: string, newCursor?: string) => {
    const { config } = get();
    if (!config) return;

    set({ loading: true, error: null });
    try {
      const client = new KarakeepClient(config);
      const response = await client.getListBookmarks(listId, newCursor);

      // Filter only link type bookmarks
      const linkBookmarks = response.bookmarks.filter(b => b.content?.type === 'link');

      set({
        bookmarks: newCursor ? [...get().bookmarks, ...linkBookmarks] : linkBookmarks,
        cursor: response.nextCursor,
        hasMore: !!response.nextCursor,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '加载书签失败',
        loading: false,
      });
    }
  },

  search: async (query: string, newCursor?: string) => {
    const { config, currentListId, allLists } = get();
    if (!config || !query.trim()) return;

    set({ loading: true, error: null, isSearchMode: true, searchQuery: query });
    try {
      const client = new KarakeepClient(config);
      // Append list: qualifier when searching within a list
      let apiQuery = query;
      if (currentListId) {
        const currentList = allLists.find(l => l.id === currentListId);
        if (currentList) {
          apiQuery = `${query} list:"${currentList.name}"`;
        }
      }
      const response = await client.searchBookmarks(apiQuery, newCursor);

      // Filter only link type bookmarks
      const linkBookmarks = response.bookmarks.filter(b => b.content?.type === 'link');

      set({
        searchResults: newCursor ? [...get().searchResults, ...linkBookmarks] : linkBookmarks,
        searchCursor: response.nextCursor,
        hasMoreSearch: !!response.nextCursor,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '搜索失败',
        loading: false,
      });
    }
  },

  loadMore: async () => {
    const { cursor, currentListId, hasMore, loading } = get();
    if (!hasMore || loading || !cursor || !currentListId) return;
    await get().loadBookmarks(currentListId, cursor);
  },

  loadMoreSearch: async () => {
    const { searchCursor, hasMoreSearch, loading, searchQuery } = get();
    if (!hasMoreSearch || loading || !searchCursor || !searchQuery) return;
    await get().search(searchQuery, searchCursor);
  },

  clearError: () => set({ error: null }),

  resetSearch: () => set({
    searchQuery: '',
    searchResults: [],
    searchCursor: null,
    hasMoreSearch: false,
    isSearchMode: false,
  }),
}));