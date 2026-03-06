// src/utils/calendar.ts
import type { CollectionEntry } from "astro:content";

// 提取常量
export const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// 格式化日期为 YY-MM 格式
export function getMonthKey(date: Date): string {
  return `${date.getFullYear().toString().slice(-2)}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// 计算日历网格所需的关键数据
export function getCalendarGrid(year: number, monthIndex: number) {
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCellsNeeded = firstDayOfWeek + daysInMonth;
  const totalGridCells = Math.ceil(totalCellsNeeded / 7) * 7;
  const trailingCellsCount = totalGridCells - totalCellsNeeded;

  return {
    firstDayOfWeek,
    daysInMonth,
    trailingCellsCount,
  };
}

// 将当月的音乐数组转换为以日期 (日) 为键的 Map
export function buildMusicMap(musicList: CollectionEntry<"music">[]) {
  const musicMap = new Map<number, CollectionEntry<"music">>();
  for (const post of musicList) {
    musicMap.set(post.data.pubDate.getDate(), post);
  }
  return musicMap;
}