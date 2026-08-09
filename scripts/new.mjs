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
import sharp from 'sharp';

dotenv.config();

// ================= 配置区域 =================
const PROXY_URL = process.env.PROXY_URL || 'http://127.0.0.1:7890'; 
// ===========================================

const agent = new HttpsProxyAgent(PROXY_URL);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

const PATHS = {
  watchContent: path.join(PROJECT_ROOT, 'src/content/watch'),
  watchAssets: path.join(PROJECT_ROOT, 'src/assets/watch'),
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
  
  // 1. 顶部：深色背景条
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
  
  // 1. 代理检测
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
      { value: 'series', label: '● Series', hint: 'TMDB TV Database' },
      { value: 'music', label: '● Music', hint: 'iTunes Database' },
    ],
  });
  checkCancel(type);

  if (type === 'movie') {
    await handleMovie();
  } else if (type === 'series') {
    await handleSeries();
  } else {
    await handleMusic();
  }

  // 结束语
  outro(color.cyan('Done.'));
}

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function fetchJson(url) {
  const response = await fetch(url, { agent });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json();
}

async function downloadPoster(
  posterPath,
  destination,
  spinnerInstance,
  label = 'non-Chinese poster',
) {
  if (!posterPath) {
    throw new Error('No non-Chinese poster is available for this title.');
  }

  spinnerInstance.start(color.blue(`› Downloading ${label}...`));
  const posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
  const response = await fetch(posterUrl, { agent });
  if (!response.ok) {
    throw new Error(`Poster download failed (${response.status})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await sharp(buffer).webp({ quality: 88 }).toFile(destination);
  spinnerInstance.stop(color.dim('Poster saved'));
}

async function confirmOverwrite(filePath, fileName) {
  if (!fs.existsSync(filePath)) return true;

  const shouldOverwrite = await confirm({
    message: `File ${color.yellow(fileName)} exists. Overwrite?`,
  });
  checkCancel(shouldOverwrite);
  return shouldOverwrite;
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
    const data = await fetchJson(searchUrl);
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

    // 英文详情优先返回英文海报；没有英文海报时由 TMDB 回退到原始语言海报。
    s.start(color.blue(`› Fetching details for "${movieZH.title}"...`));
    const detailUrl = `https://api.themoviedb.org/3/movie/${movieZH.id}?api_key=${apiKey}&language=en-US`;
    const movieEN = await fetchJson(detailUrl);
    s.stop(color.dim('Details fetched'));

    const slugName =
      slugify(movieEN.title || movieEN.original_title, {
        lower: true,
        strict: true,
      }) || `movie-${movieZH.id}`;
    const posterFilename = `${slugName}.webp`;
    const posterPath = path.join(PATHS.watchAssets, posterFilename);
    const fileName = `${slugName}.yaml`;
    const filePath = path.join(PATHS.watchContent, fileName);

    if (!(await confirmOverwrite(filePath, fileName))) {
      cancel('Aborted.');
      process.exit(0);
    }

    await downloadPoster(movieEN.poster_path, posterPath, s);

    const yamlContent = `title: ${JSON.stringify(movieZH.title)}
originalTitle: ${JSON.stringify(movieEN.original_title || movieEN.title)}
tmdbId: ${movieZH.id}
mediaType: movie
${movieEN.release_date ? `releaseDate: ${JSON.stringify(movieEN.release_date)}\n` : ''}finishedDate: ${JSON.stringify(getTodayString())}
rating: 0
coverImage: ${JSON.stringify(`../../assets/watch/${posterFilename}`)}
shortReview: ""
`;

    await fs.writeFile(filePath, yamlContent);
    
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

// ================= handleSeries =================
async function handleSeries() {
  const query = await text({
    message: 'Series Title:',
    placeholder: 'e.g. Friends, 请回答1988, or 孤独的美食家',
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
  s.start(color.blue('› Searching TMDB TV (zh-CN)...'));
  const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=zh-CN`;

  try {
    const data = await fetchJson(searchUrl);
    s.stop(color.dim('Search complete'));

    if (!data.results || data.results.length === 0) {
      cancel(color.yellow('No series found.'));
      process.exit(0);
    }

    const options = data.results.slice(0, 7).map((series) => {
      const year = series.first_air_date
        ? series.first_air_date.split('-')[0]
        : 'N/A';
      const overview = series.overview
        ? `${series.overview.substring(0, 40).replace(/\n/g, '')}...`
        : '';
      return {
        value: series,
        label: `${series.name} (${year})`,
        hint: overview,
      };
    });

    const seriesZH = await select({
      message: 'Select a series:',
      options,
    });
    checkCancel(seriesZH);

    // 使用 en-US 详情避免下载中文版海报；TMDB 会在缺图时回退到原始语言海报。
    s.start(color.blue(`› Fetching details for "${seriesZH.name}"...`));
    const detailUrl = `https://api.themoviedb.org/3/tv/${seriesZH.id}?api_key=${apiKey}&language=en-US`;
    const seriesEN = await fetchJson(detailUrl);
    s.stop(color.dim('Details fetched'));

    const regularSeasons = (seriesEN.seasons || [])
      .filter(
        (season) =>
          season.season_number > 0 &&
          season.episode_count > 0,
      )
      .sort((a, b) => a.season_number - b.season_number);

    if (regularSeasons.length === 0) {
      cancel(color.yellow('No regular seasons found. Season 0 is ignored.'));
      process.exit(0);
    }

    const slugName =
      slugify(seriesEN.name || seriesEN.original_name, {
        lower: true,
        strict: true,
      }) || `series-${seriesZH.id}`;
    const posterFilename = `${slugName}.webp`;
    const posterPath = path.join(PATHS.watchAssets, posterFilename);
    const fileName = `${slugName}.yaml`;
    const filePath = path.join(PATHS.watchContent, fileName);

    if (!(await confirmOverwrite(filePath, fileName))) {
      cancel('Aborted.');
      process.exit(0);
    }

    await downloadPoster(seriesEN.poster_path, posterPath, s);

    const seasonPosterFiles = new Map();
    for (const season of regularSeasons) {
      if (!season.poster_path) continue;

      const seasonCode = String(season.season_number).padStart(2, '0');
      const seasonPosterFilename = `${slugName}-s${seasonCode}.webp`;
      const seasonPosterPath = path.join(
        PATHS.watchAssets,
        seasonPosterFilename,
      );

      try {
        await downloadPoster(
          season.poster_path,
          seasonPosterPath,
          s,
          `Season ${seasonCode} poster`,
        );
        seasonPosterFiles.set(season.season_number, seasonPosterFilename);
      } catch (error) {
        s.stop(
          color.yellow(
            `Season ${seasonCode} poster skipped: ${error instanceof Error ? error.message : 'download failed'}`,
          ),
        );
      }
    }

    const seasonYaml = regularSeasons
      .map((season, index) => {
        const poster = seasonPosterFiles.get(season.season_number);
        const lines = [
          `  - number: ${season.season_number}`,
          `    rating: ${index === 0 ? 0 : 'to-watch'}`,
        ];
        if (poster) {
          lines.push(
            `    posterImage: ${JSON.stringify(`../../assets/watch/${poster}`)}`,
          );
        }
        lines.push('    # shortReview: ""');
        return lines.join('\n');
      })
      .join('\n');

    const yamlContent = `title: ${JSON.stringify(seriesZH.name)}
originalTitle: ${JSON.stringify(seriesEN.original_name || seriesEN.name)}
tmdbId: ${seriesZH.id}
mediaType: series
${seriesEN.first_air_date ? `releaseDate: ${JSON.stringify(seriesEN.first_air_date)}\n` : ''}# finishedDate: "YYYY-MM-DD"
coverImage: ${JSON.stringify(`../../assets/watch/${posterFilename}`)}
shortReview: ""
seasons:
${seasonYaml}
`;

    await fs.writeFile(filePath, yamlContent);

    printResultTable('SERIES ENTRY CREATED', [
      { label: 'Title', value: seriesZH.name },
      { label: 'Original', value: seriesEN.original_name || seriesEN.name },
      { label: 'Seasons', value: regularSeasons.length },
      { label: 'posters', value: seasonPosterFiles.size },
      { label: 'Filename', value: color.underline(fileName) },
      { label: 'Poster', value: color.dim(posterFilename) },
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
    const spotifyLink = `https://open.spotify.com/search/${encodeURIComponent(searchKey)}`;
    const neteaseLink = `https://music.163.com/#/search/m/?s=${encodeURIComponent(searchKey)}`;
    const qqLink = `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(searchKey)}`;

    const todayStr = getTodayString();

    // 获取歌曲的 30 秒试听直链
    const previewUrl = selectedTrack.previewUrl || "";

    const yamlContent = `title: "${selectedTrack.trackName}"
artist: "${selectedTrack.artistName}"
coverImage: "../../assets/music/${coverFilename}"
pubDate: ${todayStr}
audioPreview: "${previewUrl}"
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
