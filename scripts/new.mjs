import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import slugify from 'slugify';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { pinyin } from 'pinyin-pro';
import { intro, outro, select, text, confirm, spinner, isCancel, cancel } from '@clack/prompts';
import color from 'picocolors';

dotenv.config();

// ================= 配置区域 =================
const PROXY_URL = process.env.PROXY_URL || 'http://127.0.0.1:7890'; 
// ===========================================

const agent = new HttpsProxyAgent(PROXY_URL);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

const PATHS = {
  movieContent: path.join(PROJECT_ROOT, 'src/content/movie'),
  movieAssets: path.join(PROJECT_ROOT, 'src/assets/movie'),
  musicContent: path.join(PROJECT_ROOT, 'src/content/music'),
  musicAssets: path.join(PROJECT_ROOT, 'src/assets/music'),
};

// 确保目录存在
Object.values(PATHS).forEach(p => fs.ensureDirSync(p));

// ================= 样式与辅助函数 =================

// 1. 处理取消
function checkCancel(value) {
  if (isCancel(value)) {
    cancel(color.dim('Operation cancelled by user.'));
    process.exit(0);
  }
}

// 2. 视觉宽度 (支持中文)
function getVisualWidth(str) {
  // eslint-disable-next-line no-control-regex
  const stripped = typeof str === 'string' ? str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') : '';
  let width = 0;
  for (let i = 0; i < stripped.length; i++) {
    const charCode = stripped.charCodeAt(i);
    width += charCode <= 127 ? 1 : 2;
  }
  return width;
}

// 3. 表格渲染器
function printResultTable(title, data) {
  const labelWidth = 10; 
  const paddingX = 2;    
  
  let maxContentWidth = 0;
  
  const rows = data.map(item => {
    const valStr = String(item.value);
    const vLabel = getVisualWidth(item.label);
    const vValue = getVisualWidth(valStr);
    
    const labelPadding = ' '.repeat(Math.max(0, labelWidth - vLabel));
    
    const rowTotalWidth = labelWidth + 5 + vValue; 
    
    if (rowTotalWidth > maxContentWidth) maxContentWidth = rowTotalWidth;

    return {
      label: item.label,
      value: valStr,
      labelPadding,
      vValue
    };
  });

  const titleWidth = getVisualWidth(title) + 6;
  const boxWidth = Math.max(maxContentWidth + (paddingX * 2), titleWidth);

  // === 绘制 ===
  
  // 1. 顶部：深色背景条，更显专业
  console.log(); 
  console.log(`  ${color.bgGreen(color.black(color.bold(`  ${title}  `)))}`);
  
  // 顶部边框
  console.log(`  ${color.dim('┌' + '─'.repeat(boxWidth) + '┐')}`);

  // 2. 内容行
  rows.forEach(row => {
    const currentContentWidth = labelWidth + 5 + row.vValue;
    const rightPaddingNum = boxWidth - currentContentWidth - paddingX; 
    const rightPadding = ' '.repeat(Math.max(0, rightPaddingNum));

    console.log(
      `  ${color.dim('│')}` + 
      ` ${' '.repeat(paddingX - 1)}` + 
      `${color.cyan(row.label)}${row.labelPadding} ${color.dim('│')} ${row.value}` +
      `${rightPadding}  ${color.dim('│')}`
    );
  });

  // 3. 底部封口
  console.log(`  ${color.dim('└' + '─'.repeat(boxWidth) + '┘')}`);
  console.log();
}

// ================= 主逻辑 =================

async function main() {
  console.clear();
  
  // 极简标题
  intro(color.bgBlue(color.bold(color.white('  CONTENT MANAGER  '))));

  const s = spinner();
  
  // 1. 代理检测 (简单动词)
  s.start(color.dim('Checking network connection...'));
  try {
    const start = Date.now();
    await fetch('https://api.themoviedb.org/3/configuration', { agent, timeout: 3000 });
    const ping = Date.now() - start;
    s.stop(color.green(`✔ Network Connected (${ping}ms)`));
  } catch (e) {
    s.stop(color.yellow('! Network warning: Proxy might be unstable'));
  }

  // 2. 选择类型
  const type = await select({
    message: 'Select content type:',
    options: [
      { value: 'movie', label: '● Movie', hint: 'TMDB Database' },
      { value: 'music', label: '● Music', hint: 'iTunes Database' },
    ],
  });
  checkCancel(type);

  if (type === 'movie') {
    await handleMovie();
  } else {
    await handleMusic();
  }

  // 结束语
  outro(color.cyan('Done.'));
}

// ================= handleMovie =================
async function handleMovie() {
  const query = await text({
    message: 'Movie Title:',
    placeholder: 'e.g. Interstellar or 星际穿越',
    validate(value) {
      if (value.length === 0) return 'Title is required';
    },
  });
  checkCancel(query);

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    cancel(color.red('Error: TMDB_API_KEY not found in .env'));
    process.exit(1);
  }

  const s = spinner();
  
  // 1. 中文搜索
  s.start(color.blue('› Searching TMDB (zh-CN)...'));
  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=zh-CN`;
  
  try {
    const res = await fetch(searchUrl, { agent });
    const data = await res.json();
    s.stop(color.dim('Search complete'));

    if (!data.results || data.results.length === 0) {
      cancel(color.yellow('No results found.'));
      process.exit(0);
    }

    const options = data.results.slice(0, 5).map((m) => {
      const year = m.release_date ? m.release_date.split('-')[0] : 'N/A';
      const overview = m.overview ? (m.overview.substring(0, 40).replace(/\n/g, '') + '...') : '';
      return {
        value: m, 
        label: `${m.title} (${year})`,
        hint: overview
      };
    });

    const movieZH = await select({
      message: 'Select a movie:',
      options: options,
    });
    checkCancel(movieZH);

    // 2. 获取英文详情
    s.start(color.blue(`› Fetching details for "${movieZH.title}"...`));
    const detailUrl = `https://api.themoviedb.org/3/movie/${movieZH.id}?api_key=${apiKey}&language=en-US`;
    const detailRes = await fetch(detailUrl, { agent });
    const movieEN = await detailRes.json();
    s.stop(color.dim('Details fetched'));

    const slugName = slugify(movieEN.title, { lower: true, strict: true });
    const posterFilename = `${slugName}.webp`;
    const posterPath = path.join(PATHS.movieAssets, posterFilename);
    const posterUrl = `https://image.tmdb.org/t/p/w500${movieEN.poster_path}`;

    if (movieEN.poster_path) {
      s.start(color.blue('› Downloading poster...'));
      const imgRes = await fetch(posterUrl, { agent });
      const buffer = await imgRes.arrayBuffer();
      await fs.writeFile(posterPath, Buffer.from(buffer));
      s.stop(color.dim('Poster saved'));
    }

    let formattedReleaseDate = '01 01 1970';
    if (movieEN.release_date) {
      const [rYear, rMonth, rDay] = movieEN.release_date.split('-');
      formattedReleaseDate = `${rMonth} ${rDay} ${rYear}`;
    }

    const mdxContent = `---
title: '${movieZH.title}'
releaseDate: '${formattedReleaseDate}'
viewingDate: '${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, ' ')}'
rating: 0
coverImage: '../../assets/movie/${posterFilename}'
shortReview: ''
haveReview: false
---

暂无长评...
`;

    const fileName = `${slugName}.mdx`;
    const filePath = path.join(PATHS.movieContent, fileName);

    if (fs.existsSync(filePath)) {
      const shouldOverwrite = await confirm({
        message: `File ${color.yellow(fileName)} exists. Overwrite?`,
      });
      checkCancel(shouldOverwrite);
      if (!shouldOverwrite) {
        cancel('Aborted.');
        process.exit(0);
      }
    }

    await fs.writeFile(filePath, mdxContent);
    
    // 风格化表格
    printResultTable('MOVIE ENTRY CREATED', [
      { label: 'Title', value: movieZH.title },
      { label: 'Filename', value: color.underline(fileName) },
      { label: 'Poster', value: color.dim(posterFilename) }
    ]);

  } catch (error) {
    s.stop(color.red('Error occurred'));
    console.error(error);
  }
}

// ================= handleMusic =================
async function handleMusic() {
  const query = await text({
    message: 'Song + Artist:',
    placeholder: 'e.g. 富士山下 陈奕迅',
    validate(value) {
      if (value.length === 0) return 'Input required';
    },
  });
  checkCancel(query);

  const s = spinner();
  s.start(color.blue('› Searching iTunes (CN)...'));
  
  const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&country=CN&lang=zh_cn&limit=5`;
  
  try {
    const res = await fetch(searchUrl, { agent });
    const data = await res.json();
    s.stop(color.dim('Search complete'));

    if (data.resultCount === 0) {
      cancel(color.yellow('No music found.'));
      process.exit(0);
    }

    const options = data.results.map((t) => {
      const year = t.releaseDate ? t.releaseDate.split('-')[0] : '';
      return {
        value: t,
        label: `${t.trackName} - ${t.artistName}`,
        hint: `Album: ${t.collectionName || 'Single'} (${year})`
      };
    });

    const selectedTrack = await select({
      message: 'Select a track:',
      options: options,
    });
    checkCancel(selectedTrack);

    // 清洗逻辑
    let cleanTitle = selectedTrack.trackName;
    cleanTitle = cleanTitle.replace(/\（.*?\）/g, '').replace(/\(.*?\)/g, '');
    cleanTitle = cleanTitle.replace(/\s(feat|ft)\.?\s.*/i, '');
    cleanTitle = cleanTitle.trim();

    const pinyinArray = pinyin(cleanTitle, { toneType: 'none', type: 'array', v: true });
    
    let pinyinSlug = slugify(pinyinArray.join('-'), { lower: true, strict: true });
    if (pinyinSlug.length > 40) {
      pinyinSlug = pinyinSlug.slice(0, 40).replace(/-$/, '');
    }
    
    const baseFilename = pinyinSlug || 'unnamed-track';
    const coverFilename = `${baseFilename}.jpg`;
    const coverPath = path.join(PATHS.musicAssets, coverFilename);
    const yamlFileName = `${baseFilename}.yaml`;
    const yamlPath = path.join(PATHS.musicContent, yamlFileName);

    s.start(color.blue('› Downloading cover art...'));
    const highResUrl = selectedTrack.artworkUrl100.replace('100x100bb', '1000x1000bb');
    const imgRes = await fetch(highResUrl, { agent });
    const buffer = await imgRes.arrayBuffer();
    await fs.writeFile(coverPath, Buffer.from(buffer));
    s.stop(color.dim('Cover saved'));

    const searchKey = `${selectedTrack.trackName} ${selectedTrack.artistName}`;
    const spotifyLink = `https://open.spotify.com/search/$${encodeURIComponent(searchKey)}`;
    const neteaseLink = `https://music.163.com/#/search/m/?s=${encodeURIComponent(searchKey)}`;
    const qqLink = `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(searchKey)}`;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const yamlContent = `title: "${selectedTrack.trackName}"
artist: "${selectedTrack.artistName}"
coverImage: "../../assets/music/${coverFilename}"
pubDate: ${todayStr}
links:
  spotify: "${spotifyLink}"
  netease: "${neteaseLink}"
  qqMusic: "${qqLink}"
`;
    
    if (fs.existsSync(yamlPath)) {
      const shouldOverwrite = await confirm({
        message: `File ${color.yellow(yamlFileName)} exists. Overwrite?`,
      });
      checkCancel(shouldOverwrite);
      if (!shouldOverwrite) {
        cancel('Aborted.');
        process.exit(0);
      }
    }

    await fs.writeFile(yamlPath, yamlContent);

    // 风格化表格
    printResultTable('MUSIC ENTRY CREATED', [
      { label: 'Track', value: selectedTrack.trackName },
      { label: 'Artist', value: selectedTrack.artistName },
      { label: 'File', value: color.underline(yamlFileName) },
      { label: 'Date', value: todayStr }
    ]);

  } catch (error) {
    s.stop(color.red('Error occurred'));
    console.error(error);
  }
}

main().catch(console.error);