import type { ImageMetadata } from 'astro';
import coverQiude from '../assets/music/qiude-4.jpg';
import coverKiriT from '../assets/music/kiriTsome.webp';

export interface MusicData {
  title: string;
  artist: string;
  coverImage: ImageMetadata;
  pubDate: Date;
  links: {
    spotify?: string | null;
    netease?: string | null;
    qqMusic?: string | null;
  };
}

export const allMusic: MusicData[] = [
  {
    title: '有些话要用英文说',
    artist: 'Kiri T',
    coverImage: coverKiriT,
    pubDate: new Date('2025-11-17'),
    links: {
      spotify: null,
      netease: 'https://music.163.com/song?id=2162950892&uct2=U2FsdGVkX19Cjto4L6m1CIDNLVuZKeiWLWcuFvWkmps=', // 示例链接
      qqMusic: 'https://c6.y.qq.com/base/fcgi-bin/u?__=GYANphmIs4EP',
    }
  },
  {
    title: '请求迷失在七月森林',
    artist: '裘德 / 孙盛希',
    coverImage: coverQiude,
    pubDate: new Date('2025-11-15'),
    links: {
      spotify: null,
      netease: 'https://music.163.com/song?id=2750712095&uct2=U2FsdGVkX1+OipRIW+oTz8hmNAAB1Q57Uj+CvubhR8w=', // 示例链接
      qqMusic: null,
    }
  },
];