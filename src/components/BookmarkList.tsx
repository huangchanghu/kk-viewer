import { useCallback } from 'react';
import type { Bookmark } from '../types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
  focusedIndex?: number;
  indexOffset?: number;
  itemRefs?: React.RefObject<Map<number, HTMLElement>>;
}

export function BookmarkList({
  bookmarks,
  hasMore,
  onLoadMore,
  loading,
  focusedIndex = -1,
  indexOffset = 0,
  itemRefs,
}: BookmarkListProps) {
  const getDisplayTitle = (bookmark: Bookmark): string => {
    if (bookmark.title) return bookmark.title;
    if (bookmark.content?.type === 'link' && bookmark.content.title) {
      return bookmark.content.title;
    }
    if (bookmark.content?.type === 'link' && bookmark.content.url) {
      try {
        const url = new URL(bookmark.content.url);
        return url.hostname + url.pathname.slice(0, 20);
      } catch {
        return bookmark.content.url;
      }
    }
    return '未知标题';
  };

  const getFaviconUrl = (bookmark: Bookmark): string => {
    if (bookmark.content?.type === 'link' && bookmark.content.url) {
      try {
        const hostname = new URL(bookmark.content.url).hostname;
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
      } catch {
        return '';
      }
    }
    return '';
  };

  const getHostname = (bookmark: Bookmark): string => {
    if (bookmark.content?.type === 'link' && bookmark.content.url) {
      try {
        return new URL(bookmark.content.url).hostname;
      } catch {
        return '';
      }
    }
    return '';
  };

  const handleClick = (bookmark: Bookmark) => {
    if (bookmark.content?.type === 'link' && bookmark.content.url) {
      chrome.tabs.create({ url: bookmark.content.url });
    }
  };

  const setRef = useCallback(
    (globalIndex: number, el: HTMLElement | null) => {
      if (!itemRefs?.current) return;
      if (el) {
        itemRefs.current.set(globalIndex, el);
      } else {
        itemRefs.current.delete(globalIndex);
      }
    },
    [itemRefs],
  );

  if (bookmarks.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
        暂无书签
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1">
        {bookmarks.map((bookmark, i) => {
          const globalIndex = indexOffset + i;
          const isFocused = globalIndex === focusedIndex;
          return (
            <button
              key={bookmark.id}
              ref={(el) => setRef(globalIndex, el)}
              onClick={() => handleClick(bookmark)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors group ${
                isFocused
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFaviconUrl(bookmark) && (
                    <img
                      src={getFaviconUrl(bookmark)}
                      alt=""
                      className="w-4 h-4 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {getDisplayTitle(bookmark)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {getHostname(bookmark)}
                    </div>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {hasMore && (
        <div className="py-3 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md disabled:opacity-50"
          >
            {loading ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </div>
  );
}
