import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Breadcrumb } from './Breadcrumb';
import { SearchBar } from './SearchBar';
import { BookmarkList } from './BookmarkList';
import type { ZBookmarkList, NavItem } from '../types';

export function ListPage() {
  const {
    startEditConfig,
    allLists,
    currentListId,
    currentPath,
    bookmarks,
    hasMore,
    loading,
    error,
    isSearchMode,
    searchResults,
    hasMoreSearch,
    searchQuery,
    loadLists,
    navigateTo,
    loadMore,
    loadMoreSearch,
    clearError,
    resetSearch,
  } = useStore();

  // Only load lists on mount, bookmarks are loaded by navigateTo
  useEffect(() => {
    loadLists();
  }, [loadLists]);

  // Get child lists for current level
  const getChildLists = (): ZBookmarkList[] => {
    return allLists.filter((list) => list.parentId === currentListId);
  };

  // Get root lists (parentId is null)
  const getRootLists = (): ZBookmarkList[] => {
    return allLists.filter((list) => list.parentId === null);
  };

  const childLists = currentListId ? getChildLists() : getRootLists();
  const isRootPage = currentListId === null;

  const handleListClick = (list: ZBookmarkList) => {
    const navItem: NavItem = {
      id: list.id,
      name: list.name,
      icon: list.icon,
    };
    navigateTo(navItem);
  };

  const handleHomeClick = () => {
    navigateTo(null);
    resetSearch();
  };

  const displayedBookmarks = isSearchMode ? searchResults : bookmarks;
  const displayHasMore = isSearchMode ? hasMoreSearch : hasMore;
  const handleLoadMore = isSearchMode ? loadMoreSearch : loadMore;

  return (
    <div className="w-[360px] h-[500px] flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h1
          className="text-lg font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
          onClick={handleHomeClick}
        >
          Karakeep
        </h1>
        <button
          onClick={startEditConfig}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="设置"
        >
          设置
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <SearchBar />
      </div>

      {/* Error Toast */}
      {error && (
        <div className="mx-4 mt-2 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm flex items-center justify-between shrink-0">
          <span>{error}</span>
          <button onClick={clearError} className="ml-2 hover:text-red-900 dark:hover:text-red-100">
            ✕
          </button>
        </div>
      )}

      {/* Search indicator */}
      {isSearchMode && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 shrink-0">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            搜索 "{searchQuery}" 的结果
          </span>
        </div>
      )}

      {/* Breadcrumb */}
      {!isSearchMode && currentPath.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <Breadcrumb />
        </div>
      )}

      {/* Content - Scrollable container */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Child Lists - show on root page or when not in search mode */}
        {(!isSearchMode || isRootPage) && childLists.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="px-4 py-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {isRootPage ? '' : '列表'}
              </div>
              <div className="space-y-1">
                {childLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleListClick(list)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <span>{list.icon}</span>
                    <span className="text-sm text-gray-900 dark:text-white">{list.name}</span>
                    <svg
                      className="w-4 h-4 text-gray-400 ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookmarks - only show when inside a list (not on root page) */}
        {!isRootPage && !isSearchMode && (
          <div className="flex-1 flex flex-col px-4 py-2 min-h-0">
            {childLists.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 shrink-0">书签</div>
            )}
            {loading && displayedBookmarks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <BookmarkList
                bookmarks={displayedBookmarks}
                hasMore={displayHasMore}
                onLoadMore={handleLoadMore}
                loading={loading}
              />
            )}
          </div>
        )}

        {/* Search results */}
        {isSearchMode && (
          <div className="flex-1 flex flex-col px-4 py-2 min-h-0">
            {loading && displayedBookmarks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <BookmarkList
                bookmarks={displayedBookmarks}
                hasMore={displayHasMore}
                onLoadMore={handleLoadMore}
                loading={loading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}