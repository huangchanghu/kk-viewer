# AGENTS.md

## Project Overview

Karakeep Viewer (kk-viewer) is a Chrome/Edge Manifest V3 browser extension for viewing bookmarks from a self-hosted Karakeep instance. It is a read-only viewer with hierarchical list navigation, breadcrumb navigation, bookmark search, and dark/light theme support.

## Tech Stack

- **Runtime**: Chrome Extension (Manifest V3), popup-based UI
- **Framework**: React 18 + TypeScript
- **Build**: Vite 6 + @crxjs/vite-plugin
- **Styling**: Tailwind CSS 3 (dark mode via `class` strategy)
- **State**: Zustand 5 (single store)
- **API**: Karakeep REST API v1 (Bearer token auth)

## Build & Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Development with hot reload (load dist/ as unpacked extension)
npm run build            # Production build (runs tsc then vite build)
```

- `npm run build` runs `tsc && vite build` — TypeScript type checking is enforced at build time
- After `npm run dev` or `npm run build`, load `dist/` in Chrome/Edge as an unpacked extension
- There is no dedicated lint or test command configured

## Project Structure

```
├── manifest.json              # Extension manifest (MV3)
├── vite.config.ts             # Vite config with CRX plugin
├── tailwind.config.js         # Tailwind (darkMode: 'class')
├── tsconfig.json              # Strict TypeScript config
├── scripts/
│   └── generate-icons.ts      # Icon generation script
├── src/
│   ├── popup/
│   │   ├── index.html         # Popup HTML entry
│   │   ├── index.tsx          # React entry, dark mode detection
│   │   └── styles.css         # Tailwind base styles
│   ├── App.tsx                # Root component: ConfigPage vs ListPage
│   ├── types.ts               # All TypeScript interfaces
│   ├── api/
│   │   └── karakeep.ts        # KarakeepClient (REST API wrapper)
│   ├── store/
│   │   └── useStore.ts        # Zustand store (single source of truth)
│   ├── hooks/
│   │   └── useVimKeybindings.ts  # Modal vim keyboard system
│   ├── components/
│   │   ├── ConfigPage.tsx      # API URL/Key configuration
│   │   ├── ListPage.tsx        # Main bookmark list view
│   │   ├── BookmarkList.tsx    # Bookmark item rendering
│   │   ├── Breadcrumb.tsx      # Breadcrumb navigation
│   │   ├── SearchBar.tsx       # Search input
│   │   └── HelpPanel.tsx       # Vim keybinding help overlay
│   └── utils/
│       └── storage.ts          # chrome.storage.local wrapper
```

## Architecture

### Entry Point & Routing

1. `src/popup/index.tsx` — React entry, detects system dark mode preference
2. `src/App.tsx` — Loads config from chrome.storage; renders `ConfigPage` if no config or editing, otherwise `ListPage`

### State Management

Single Zustand store (`src/store/useStore.ts`) manages all state:

| State Group | Key Fields |
|---|---|
| Config | `config`, `configLoading`, `isEditingConfig` |
| Navigation | `currentPath` (NavItem[]), `currentListId` |
| Data | `allLists`, `bookmarks`, `cursor`, `hasMore` |
| Search | `searchQuery`, `searchResults`, `searchCursor`, `hasMoreSearch`, `isSearchMode` |
| Pinned Lists | `pinnedLists` (persisted via chrome.storage) |
| Vim | `focusedIndex`, `vimMode`, `isHelpOpen` |
| UI | `loading`, `error` |

### API Client

`src/api/karakeep.ts` — `KarakeepClient` class:
- Constructor takes `{ apiUrl, apiKey }`, strips trailing slash
- All requests include `Authorization: Bearer {apiKey}`
- Cursor-based pagination (default 50 per page)
- `testConnection()` calls `getLists()` to validate credentials

### Data Flow

1. App loads → `loadConfig()` from chrome.storage
2. No config → ConfigPage; has config → ListPage
3. ListPage mounts → `loadLists()` fetches all lists
4. `navigateTo(item)` → clears bookmarks, sets path, calls `loadBookmarks(listId)`
5. Search → `search()` sets `isSearchMode: true`, populates `searchResults`
6. Root page (`currentListId === null`) shows only root lists, no bookmarks

### Vim Keybindings

`src/hooks/useVimKeybindings.ts` — modal keyboard system:

| Mode | Key | Action |
|---|---|---|
| Normal | `j`/`k` | Move focus down/up (supports count prefix) |
| Normal | `l`/`Enter` | Enter list / Open bookmark in new tab |
| Normal | `h`/`Backspace` | Navigate back |
| Normal | `o` | Open bookmark in current tab |
| Normal | `O` | Open bookmark in new tab |
| Normal | `g`+`g` | Jump to first item |
| Normal | `G` | Jump to last item |
| Normal | `{n}G` | Jump to nth item |
| Normal | `p` | Toggle pin on focused list |
| Normal | `/`/`i` | Enter insert mode (focus search) |
| Normal | `?` | Toggle help panel |
| Normal | `Esc` | Close popup |
| Insert | `Esc` | Return to normal mode |

Focusable items are a flat list of pinned lists + child lists + bookmarks (or search results), indexed by global position. Item DOM refs stored in `Map<number, HTMLElement>`.

## Type System

All types in `src/types.ts`:

- `Config` — `{ apiUrl: string; apiKey: string }`
- `ZBookmarkList` — List with `id`, `name`, `icon`, `parentId` (null = root), `type` ('manual'|'smart')
- `Bookmark` — Bookmark with `title`, `content` (link/text/asset), `tags`, `assets`
- `BookmarkContent` — `{ type, url?, title?, description?, imageUrl? }`
- `NavItem` — `{ id: string | null; name: string; icon?: string }`
- `FocusableItem` — `{ type: 'list'; data: ZBookmarkList } | { type: 'bookmark'; data: Bookmark }`
- `PaginatedBookmarks` — `{ bookmarks: Bookmark[]; nextCursor: string | null }`

## Key Implementation Details

- **Bookmark title fallback chain**: `bookmark.title` → `bookmark.content.title` → URL
- **List hierarchy**: Lists have `parentId`; child lists computed by filtering `allLists` where `parentId === currentListId`
- **Navigation clears state**: `navigateTo()` clears bookmarks before loading to prevent stale content
- **Search scope**: When inside a list, search appends `list:"{listName}"` qualifier
- **Only link bookmarks**: API responses filtered to `content.type === 'link'`
- **Dark mode**: Tailwind `class` strategy; dark class toggled on `<html>` in `popup/index.tsx`
- **Chrome storage**: Config and pinned lists persisted via `chrome.storage.local`
- **Popup size**: Fixed 360x500px viewport

## Code Conventions

- **Language**: TypeScript with strict mode (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- **Styling**: Tailwind utility classes only; no custom CSS beyond Tailwind base
- **State**: Single Zustand store, no splitting; access via `useStore` hook or `useStore.getState()`
- **Components**: Functional React components with named exports
- **No comments**: Code should be self-documenting; avoid adding comments unless requested
- **No emojis**: Do not add emojis to code or strings unless explicitly requested
- **Error messages**: User-facing errors are in Chinese (e.g., 'API Key无效或已过期', '加载列表失败', '搜索失败')
- **No test framework**: No tests are currently configured; do not add test dependencies unless requested

## Karakeep API Reference

Base URL: `{apiUrl}/api/v1`
Authentication: `Authorization: Bearer {apiKey}`

| Endpoint | Description |
|---|---|
| `GET /lists` | Get all lists |
| `GET /lists/{listId}/bookmarks?limit={n}&cursor={c}` | Get bookmarks in a list |
| `GET /bookmarks?limit={n}&cursor={c}` | Get all bookmarks |
| `GET /bookmarks/search?q={query}&limit={n}&cursor={c}` | Full-text search |

## Validation Commands

Before considering work complete, run:

```bash
npm run build
```

This runs `tsc` (type checking) then `vite build`. Both must succeed with zero errors.
