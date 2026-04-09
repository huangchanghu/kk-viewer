import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore } from '../store/useStore';
import type { FocusableItem } from '../types';

interface UseVimKeybindingsOptions {
  focusableItems: FocusableItem[];
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  itemRefs: React.RefObject<Map<number, HTMLElement>>;
}

export function useVimKeybindings({
  focusableItems,
  searchInputRef,
  itemRefs,
}: UseVimKeybindingsOptions) {
  const pendingG = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const numberBuffer = useRef('');
  const numberTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearNumberBuffer = useCallback(() => {
    numberBuffer.current = '';
    if (numberTimer.current) {
      clearTimeout(numberTimer.current);
      numberTimer.current = null;
    }
  }, []);

  const resetNumberTimer = useCallback(() => {
    if (numberTimer.current) clearTimeout(numberTimer.current);
    numberTimer.current = setTimeout(() => {
      numberBuffer.current = '';
      numberTimer.current = null;
    }, 1000);
  }, []);

  // Track a scroll revision counter — bumped every time we want to scroll after render
  const [scrollRevision, setScrollRevision] = useState(0);

  const requestScroll = useCallback(() => {
    setScrollRevision((r) => r + 1);
  }, []);

  // After render, scroll the focused item into view — only if it's outside the visible area
  useEffect(() => {
    if (scrollRevision === 0) return;
    const { focusedIndex } = useStore.getState();
    const el = itemRefs.current?.get(focusedIndex);
    if (!el) return;

    const scrollParent = el.closest('.overflow-y-auto');
    if (!scrollParent) {
      el.scrollIntoView({ block: 'start' });
      return;
    }

    const parentRect = scrollParent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const isVisible =
      elRect.top >= parentRect.top && elRect.bottom <= parentRect.bottom;

    if (!isVisible) {
      el.scrollIntoView({ block: 'start' });
    }
  }, [scrollRevision, itemRefs]);

  const moveFocus = useCallback(
    async (delta: number) => {
      const { focusedIndex, setFocusedIndex } = useStore.getState();
      const maxIndex = focusableItems.length - 1;
      if (maxIndex < 0) return;

      let newIndex = focusedIndex + delta;

      // Auto-load more when moving past the end
      if (newIndex > maxIndex && delta > 0) {
        const state = useStore.getState();
        const canLoadMore = state.isSearchMode
          ? state.hasMoreSearch
          : state.hasMore;
        if (canLoadMore && !state.loading) {
          const loadFn = state.isSearchMode
            ? state.loadMoreSearch
            : state.loadMore;
          await loadFn();
          setFocusedIndex(maxIndex + 1);
          requestScroll();
          return;
        }
        newIndex = maxIndex;
      }

      newIndex = Math.max(0, Math.min(newIndex, maxIndex));
      setFocusedIndex(newIndex);
      requestScroll();
    },
    [focusableItems, requestScroll],
  );

  const enterOrOpen = useCallback(
    (key: string) => {
      const { focusedIndex, navigateTo } = useStore.getState();
      const item = focusableItems[focusedIndex];
      if (!item) return;

      if (item.type === 'list') {
        navigateTo({ id: item.data.id, name: item.data.name, icon: item.data.icon });
      } else if (item.type === 'bookmark' && key === 'Enter') {
        // Enter on bookmark opens in new tab
        const url = item.data.content?.type === 'link' ? item.data.content.url : undefined;
        if (url) {
          chrome.tabs.create({ url });
        }
      }
      // 'l' on bookmark: no action
    },
    [focusableItems],
  );

  const openBookmark = useCallback(
    (target: 'current' | 'new') => {
      const { focusedIndex } = useStore.getState();
      const item = focusableItems[focusedIndex];
      if (!item || item.type !== 'bookmark') return;

      const url = item.data.content?.type === 'link' ? item.data.content.url : undefined;
      if (!url) return;

      if (target === 'current') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.update(tabs[0].id, { url });
          }
        });
      } else {
        chrome.tabs.create({ url });
      }
    },
    [focusableItems],
  );

  const goBack = useCallback(() => {
    const { currentListId, navigateBack } = useStore.getState();
    if (currentListId !== null) {
      navigateBack();
    }
  }, []);

  const togglePin = useCallback(() => {
    const { focusedIndex, isPinned, pinList, unpinList } = useStore.getState();
    const item = focusableItems[focusedIndex];
    if (!item || item.type !== 'list') return;

    if (isPinned(item.data.id)) {
      unpinList(item.data.id);
    } else {
      pinList(item.data.id);
    }
  }, [focusableItems]);

  const enterInsertMode = useCallback(() => {
    useStore.getState().setVimMode('insert');
    searchInputRef.current?.focus();
  }, [searchInputRef]);

  const jumpTo = useCallback(
    async (target: 'first' | 'last' | number) => {
      const maxIndex = focusableItems.length - 1;
      if (maxIndex < 0) return;

      let newIndex: number;
      if (target === 'first') {
        newIndex = 0;
      } else if (target === 'last') {
        // Trigger load more if possible
        const state = useStore.getState();
        const canLoadMore = state.isSearchMode
          ? state.hasMoreSearch
          : state.hasMore;
        if (canLoadMore && !state.loading) {
          const loadFn = state.isSearchMode
            ? state.loadMoreSearch
            : state.loadMore;
          await loadFn();
        }
        newIndex = maxIndex;
      } else {
        // number: 1-based index like vim line numbers
        newIndex = Math.max(0, Math.min(target - 1, maxIndex));
      }

      useStore.getState().setFocusedIndex(newIndex);
      requestScroll();
    },
    [focusableItems, requestScroll],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const { vimMode, isHelpOpen, setHelpOpen, setVimMode } =
        useStore.getState();

      // Help panel open: only respond to ? and Esc
      if (isHelpOpen) {
        if (e.key === '?' || e.key === 'Escape') {
          setHelpOpen(false);
          e.preventDefault();
        }
        return;
      }

      // Insert mode: only respond to Esc
      if (vimMode === 'insert') {
        if (e.key === 'Escape') {
          setVimMode('normal');
          searchInputRef.current?.blur();
          e.preventDefault();
        }
        return;
      }

      // Normal mode
      // Collect number prefix
      if (/^[1-9]$/.test(e.key) && numberBuffer.current.length < 2) {
        numberBuffer.current += e.key;
        resetNumberTimer();
        e.preventDefault();
        return;
      }
      if (e.key === '0' && numberBuffer.current.length > 0 && numberBuffer.current.length < 2) {
        numberBuffer.current += e.key;
        resetNumberTimer();
        e.preventDefault();
        return;
      }

      const hasNumberPrefix = numberBuffer.current.length > 0;
      const count = parseInt(numberBuffer.current) || 1;
      clearNumberBuffer();

      switch (e.key) {
        case 'j':
          moveFocus(count);
          e.preventDefault();
          break;
        case 'k':
          moveFocus(-count);
          e.preventDefault();
          break;
        case 'l':
          enterOrOpen('l');
          e.preventDefault();
          break;
        case 'Enter':
          enterOrOpen('Enter');
          e.preventDefault();
          break;
        case 'h':
        case 'Backspace':
          goBack();
          e.preventDefault();
          break;
        case 'o':
          openBookmark('current');
          e.preventDefault();
          break;
        case 'O':
          openBookmark('new');
          e.preventDefault();
          break;
        case '/':
        case 'i':
          enterInsertMode();
          e.preventDefault();
          break;
        case 'Escape':
          window.close();
          break;
        case 'g':
          if (pendingG.current) {
            // gg: jump to top
            pendingG.current = false;
            if (gTimer.current) {
              clearTimeout(gTimer.current);
              gTimer.current = null;
            }
            jumpTo('first');
            e.preventDefault();
          } else {
            pendingG.current = true;
            gTimer.current = setTimeout(() => {
              pendingG.current = false;
              gTimer.current = null;
            }, 500);
            e.preventDefault();
          }
          break;
        case 'G':
          if (hasNumberPrefix) {
            jumpTo(count);
          } else {
            jumpTo('last');
          }
          e.preventDefault();
          break;
        case 'p':
          togglePin();
          e.preventDefault();
          break;
        case '?':
          setHelpOpen(true);
          e.preventDefault();
          break;
        default:
          // Unknown key: clear pending g
          if (pendingG.current) {
            pendingG.current = false;
            if (gTimer.current) {
              clearTimeout(gTimer.current);
              gTimer.current = null;
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [
    moveFocus,
    enterOrOpen,
    openBookmark,
    goBack,
    enterInsertMode,
    jumpTo,
    togglePin,
    clearNumberBuffer,
    resetNumberTimer,
    searchInputRef,
  ]);

  // Clamp focusedIndex when focusableItems changes
  useEffect(() => {
    const { focusedIndex, setFocusedIndex } = useStore.getState();
    if (focusableItems.length === 0) {
      if (focusedIndex !== 0) setFocusedIndex(0);
      return;
    }
    const maxIndex = focusableItems.length - 1;
    if (focusedIndex > maxIndex) {
      setFocusedIndex(maxIndex);
    }
  }, [focusableItems]);
}
