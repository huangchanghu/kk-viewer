# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Karakeep Viewer is a Chrome/Edge browser extension for viewing bookmarks from a self-hosted Karakeep instance. It's a read-only viewer that supports hierarchical list navigation with breadcrumb navigation, bookmark search, and dark/light theme support.

## Build Commands

```bash
npm install      # Install dependencies
npm run dev      # Development mode with hot reload (load dist/ as unpacked extension)
npm run build    # Production build to dist/
```

After running `npm run dev` or `npm run build`, load the `dist/` directory in Chrome/Edge as an unpacked extension.

## Architecture

### Entry Point
- `src/popup/index.tsx` - React entry point, handles dark mode detection
- `src/App.tsx` - Main component, decides between ConfigPage and ListPage based on config state

### State Management
Single Zustand store at `src/store/useStore.ts` manages:
- **Config**: API URL/Key storage via `chrome.storage.local`
- **Navigation**: `currentPath` (breadcrumb), `currentListId` for hierarchical navigation
- **Data**: `allLists` (all lists from API), `bookmarks` for current list
- **Search**: Separate `searchResults` and `searchCursor` for search mode
- **UI**: `loading`, `error`, `isSearchMode` states

Key navigation logic: `navigateTo(item)` handles both entering a list and breadcrumb clicks. Root page (`currentListId === null`) shows only root lists, no bookmarks.

### API Client
`src/api/karakeep.ts` - KarakeepClient class wraps REST API calls:
- Bearer token authentication
- All responses filtered to `type === 'link'` bookmarks only
- Cursor-based pagination (50 items per page)

### Data Flow
1. App loads → `loadConfig()` from chrome.storage
2. If no config → ConfigPage; else → ListPage
3. ListPage mounts → `loadLists()` fetches all lists
4. Navigate to list → `navigateTo()` clears bookmarks, then `loadBookmarks(listId)`
5. Search → `search()` sets `isSearchMode: true`, uses separate `searchResults` state

### Types
`src/types.ts` contains all TypeScript interfaces matching Karakeep API schema:
- `ZBookmarkList` - List with id, name, icon, parentId (for hierarchy), type (manual/smart)
- `Bookmark` - Bookmark with title, content (link/text/asset), tags, assets
- `Config` - API URL and Key

## Key Implementation Details

- **Bookmark title display**: Uses `bookmark.title` (user-set) → `bookmark.content.title` (crawled) → URL as fallback
- **List hierarchy**: Lists have `parentId` (null for root), child lists computed by filtering `allLists`
- **Navigation clears state**: `navigateTo()` clears bookmarks before loading to prevent stale content flicker
- **Search is global**: No list-scoped search API available, search always queries all bookmarks

## Karakeep API Reference

Base URL: `{apiUrl}/api/v1`
Authentication: `Authorization: Bearer {apiKey}`

| Endpoint | Description |
|----------|-------------|
| `GET /lists` | Get all lists |
| `GET /lists/{listId}/bookmarks` | Get bookmarks in a list |
| `GET /bookmarks/search?q={query}` | Full-text search |
| `GET /bookmarks?listId={id}` | Get bookmarks filtered by list |