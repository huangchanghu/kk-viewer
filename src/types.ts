// Karakeep API Types

export interface ZBookmarkList {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  parentId: string | null;
  type: 'manual' | 'smart';
  query: string | null;
  public: boolean;
  hasCollaborators: boolean;
  userRole: 'owner' | 'editor' | 'viewer' | 'public';
}

export interface BookmarkTag {
  id: string;
  name: string;
  attachedBy: 'ai' | 'human';
}

export interface BookmarkAsset {
  id: string;
  assetType: string;
  fileName: string | null;
}

export interface BookmarkContent {
  type: 'link' | 'text' | 'asset' | 'unknown';
  url?: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
}

export interface Bookmark {
  id: string;
  createdAt: string;
  modifiedAt: string | null;
  title: string | null;
  archived: boolean;
  favourited: boolean;
  taggingStatus: string | null;
  summarizationStatus: string | null;
  note: string | null;
  summary: string | null;
  source: string | null;
  userId: string;
  tags: BookmarkTag[];
  content: BookmarkContent;
  assets: BookmarkAsset[];
}

export interface PaginatedBookmarks {
  bookmarks: Bookmark[];
  nextCursor: string | null;
}

export interface ListsResponse {
  lists: ZBookmarkList[];
}

export interface Config {
  apiUrl: string;
  apiKey: string;
}

export interface NavItem {
  id: string | null;
  name: string;
  icon?: string;
}

export type FocusableItem =
  | { type: 'list'; data: ZBookmarkList }
  | { type: 'bookmark'; data: Bookmark };