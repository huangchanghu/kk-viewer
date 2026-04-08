import { useEffect } from 'react';
import { useStore } from '../store/useStore';
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
    pinnedLists,
    pinList,
    unpinList,
    isPinned,
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

  // Get pinned lists that exist in allLists
  const getPinnedLists = (): ZBookmarkList[] => {
    return allLists.filter((list) => pinnedLists.includes(list.id));
  };

  const pinnedListsData = getPinnedLists();
  const currentListPinned = currentListId ? isPinned(currentListId) : false;

  const handleListClick = (list: ZBookmarkList) => {
    const navItem: NavItem = {
      id: list.id,
      name: list.name,
      icon: list.icon,
    };
    navigateTo(navItem);
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentListId) {
      if (currentListPinned) {
        unpinList(currentListId);
      } else {
        pinList(currentListId);
      }
    }
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
            {currentListId && currentPath.length > 0
              ? `在"${currentPath[currentPath.length - 1].name}"中搜索 "${searchQuery}"`
              : `搜索 "${searchQuery}" 的结果`}
          </span>
        </div>
      )}

      {/* Breadcrumb */}
      {!isSearchMode && currentPath.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-1 text-sm overflow-x-auto py-1">
            <button
              onClick={handleHomeClick}
              className="text-blue-600 dark:text-blue-400 hover:underline shrink-0"
            >
              首页
            </button>
            {currentPath.map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-1 shrink-0">
                <span className="text-gray-400 dark:text-gray-500">/</span>
                {item.icon && <span>{item.icon}</span>}
                <button
                  onClick={() => navigateTo(item)}
                  className={`hover:underline ${
                    index === currentPath.length - 1
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {item.name}
                </button>
                {index === currentPath.length - 1 && currentListId && (
                  <button
                    onClick={handlePinClick}
                    className={`ml-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                      currentListPinned ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`}
                    title={currentListPinned ? '取消固定' : '将列表固定到首页'}
                  >
                    {currentListPinned ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H7V2H17V4H16V12L18 14V16H12.8V22H11.2V16H6V14L8 12V4Z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content - Scrollable container */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Pinned Lists - only show on root page */}
        {!isSearchMode && isRootPage && pinnedListsData.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="px-4 py-2">
              <div className="space-y-1">
                {pinnedListsData.map((list) => (
                  <div key={list.id} className="flex items-center gap-2">
                    <button
                      onClick={() => handleListClick(list)}
                      className="flex-1 text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unpinList(list.id);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="取消固定"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Child Lists - show on root page or when not in search mode */}
        {!isSearchMode && childLists.length > 0 && (
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