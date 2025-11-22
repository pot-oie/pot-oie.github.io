// src/env.d.ts

/// <reference path="../.astro/types.d.ts" />

import type Lenis from 'lenis';

// 全局声明 Window 接口
declare global {
  interface Window {
    lenis: Lenis;
  }
}

// 声明 Pagefind 模块
declare module "/pagefind/pagefind.js" {
  export interface PagefindSearchOptions {
    excerptLength?: number;
  }

  export interface PagefindSearchResult {
    url: string;
    excerpt: string;
    meta: {
      title: string;
      [key: string]: any;
    };
    // 如果你需要 content，可以加上
    // content?: string; 
  }

  export interface PagefindSearchFragment {
    id: string;
    data: () => Promise<PagefindSearchResult>;
  }

  export interface PagefindResponse {
    results: PagefindSearchFragment[];
  }

  export function options(opts: PagefindSearchOptions): Promise<void>;
  export function search(query: string): Promise<PagefindResponse>;
  export function init(): Promise<void>;
}