import type { Config, ListsResponse, PaginatedBookmarks } from '../types';

export class KarakeepClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: Config) {
    // Remove trailing slash from URL
    this.baseUrl = config.apiUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/api/v1${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API Key无效或已过期');
      }
      if (response.status >= 500) {
        throw new Error('服务器错误，请稍后重试');
      }
      throw new Error(`请求失败: ${response.status}`);
    }

    return response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getLists();
      return true;
    } catch {
      return false;
    }
  }

  async getLists(): Promise<ListsResponse> {
    return this.request<ListsResponse>('/lists');
  }

  async getListBookmarks(listId: string, cursor?: string, limit = 50): Promise<PaginatedBookmarks> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cursor) {
      params.set('cursor', cursor);
    }
    return this.request<PaginatedBookmarks>(`/lists/${listId}/bookmarks?${params}`);
  }

  async getBookmarks(cursor?: string, limit = 50): Promise<PaginatedBookmarks> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cursor) {
      params.set('cursor', cursor);
    }
    return this.request<PaginatedBookmarks>(`/bookmarks?${params}`);
  }

  async searchBookmarks(query: string, cursor?: string, limit = 50): Promise<PaginatedBookmarks> {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('limit', String(limit));
    if (cursor) {
      params.set('cursor', cursor);
    }
    return this.request<PaginatedBookmarks>(`/bookmarks/search?${params}`);
  }
}