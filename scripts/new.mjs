import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import inquirer from 'inquirer';
import slugify from 'slugify';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// ================= 配置区域 =================
const PROXY_URL = 'http://127.0.0.1:7890'; 
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

Object.values(PATHS).forEach(p => fs.ensureDirSync(p));

async function main() {
  try {
    console.log(`🔌 正在初始化...`);
    await fetch('https://api.themoviedb.org/3/configuration', { agent, timeout: 5000 });
  } catch (e) {
    console.warn(`⚠️ 警告: 连接 TMDB 似乎有点慢，或代理未生效。错误: ${e.message}`);
  }

  const { type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: '你要添加什么内容？',
      choices: [
        { name: '🎬 电影 (Movie)', value: 'movie' },
        { name: '🎵 音乐 (Music)', value: 'music' }
      ]
    }
  ]);

  if (type === 'movie') {
    await handleMovie();
  } else {
    await handleMusic();
  }
}

// ================= handleMovie =================
async function handleMovie() {
  const { query } = await inquirer.prompt([{ type: 'input', name: 'query', message: '请输入电影名称 (英文需带空格):' }]);
  
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error('❌ 错误: 请在 .env 文件中配置 TMDB_API_KEY');
    return;
  }

  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=zh-CN`;
  
  try {
    const res = await fetch(searchUrl, { agent });
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      console.log('❌ 未找到相关电影。');
      return;
    }

    const movies = data.results.slice(0, 5);

    // 1. 结果打印
    console.log('\n🔎 找到了以下电影，请核对信息：');
    console.log('------------------------------------------------');
    movies.forEach((m, index) => {
      const year = m.release_date ? m.release_date.split('-')[0] : '未知年份';
      console.log(`[${index + 1}] ${m.title} (${year})  --- ID: ${m.id}`);
      // 打印简短剧情，方便确认
      const overview = m.overview ? (m.overview.substring(0, 50) + '...') : '无简介';
      console.log(`    ↳ 剧情: ${overview}\n`);
    });
    console.log('------------------------------------------------');

    // 2. 输入数字序号
    const { selectIndex } = await inquirer.prompt([
      {
        type: 'number',
        name: 'selectIndex',
        message: '请输入想下载的电影【序号】 (例如 1):',
        validate: (value) => {
          if (value >= 1 && value <= movies.length) return true;
          return `请输入 1 到 ${movies.length} 之间的数字`;
        }
      }
    ]);

    // 3. 取数组
    const selectedMovie = movies[selectIndex - 1]; 

    // ================= 生成文件 =================
    const posterFilename = `${slugify(selectedMovie.title, { lower: true, remove: /[*+~.()'"!:@]/g })}-${selectedMovie.id}.webp`;
    const posterUrl = `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`;
    const posterPath = path.join(PATHS.movieAssets, posterFilename);
    
    console.log(`⬇️ 正在下载海报: ${posterUrl}`);
    const imgRes = await fetch(posterUrl, { agent });
    const buffer = await imgRes.arrayBuffer();
    await fs.writeFile(posterPath, Buffer.from(buffer));

    let formattedReleaseDate = '';
    if (selectedMovie.release_date) {
      const [rYear, rMonth, rDay] = selectedMovie.release_date.split('-');
      formattedReleaseDate = `${rMonth} ${rDay} ${rYear}`;
    } else {
      formattedReleaseDate = '01 01 1970';
    }

    const mdxContent = `---
title: '${selectedMovie.title}'
releaseDate: '${formattedReleaseDate}'
viewingDate: '${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, ' ')}'
rating: 0
coverImage: '../../assets/movie/${posterFilename}'
shortReview: ''
haveReview: false
---

这里写长评...
`;

    const fileName = `${slugify(selectedMovie.title, { lower: true, remove: /[*+~.()'"!:@]/g })}.mdx`;
    const filePath = path.join(PATHS.movieContent, fileName);
    await fs.writeFile(filePath, mdxContent);

    console.log(`\n✅ 电影已创建: src/content/movie/${fileName}`);
    console.log(`🖼️ 海报已保存: src/assets/movie/${posterFilename}`);

  } catch (error) {
    console.error('❌ 发生异常:', error);
  }
}

// ================= handleMusic =================
async function handleMusic() {
  const { query } = await inquirer.prompt([{ type: 'input', name: 'query', message: '请输入 歌曲名+歌手:' }]);

  // 代理
  const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=5`;
  
  try {
    const res = await fetch(searchUrl, { agent });
    const data = await res.json();

    if (data.resultCount === 0) {
      console.log('❌ 未找到相关音乐');
      return;
    }

    const tracks = data.results;

    // 1. 打印列表
    console.log('\n🎵 找到了以下音乐，请核对信息：');
    console.log('------------------------------------------------');
    tracks.forEach((t, index) => {
      console.log(`[${index + 1}] ${t.trackName} - ${t.artistName}`);
      console.log(`    ↳ 专辑: ${t.collectionName} (${t.releaseDate.split('-')[0]})\n`);
    });
    console.log('------------------------------------------------');

    // 2. 输入序号
    const { selectIndex } = await inquirer.prompt([
      {
        type: 'number',
        name: 'selectIndex',
        message: '请输入想下载的歌曲【序号】 (例如 1):',
        validate: (value) => {
          if (value >= 1 && value <= tracks.length) return true;
          return `请输入 1 到 ${tracks.length} 之间的数字`;
        }
      }
    ]);

    const selectedTrack = tracks[selectIndex - 1];

    // ================= 生成文件逻辑 =================
    const highResUrl = selectedTrack.artworkUrl100.replace('100x100bb', '1000x1000bb');
    
    // 开启 strict: true，自动去除 ? / : 等 Windows 非法字符
    const safeTitle = slugify(selectedTrack.trackName, { lower: true, strict: true });
    
    const coverFilename = `${safeTitle}.jpg`;
    const coverPath = path.join(PATHS.musicAssets, coverFilename);

    console.log(`⬇️ 正在下载封面...`);
    const imgRes = await fetch(highResUrl, { agent });
    const buffer = await imgRes.arrayBuffer();
    await fs.writeFile(coverPath, Buffer.from(buffer));

    // 生成搜索关键词
    const searchKey = `${selectedTrack.trackName} ${selectedTrack.artistName}`;
    
    // 生成各平台搜索直达链接
    const spotifyLink = `https://open.spotify.com/search/${encodeURIComponent(searchKey)}`;
    const neteaseLink = `https://music.163.com/#/search/m/?s=${encodeURIComponent(searchKey)}`;
    const qqLink = `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(searchKey)}`;

    // 写入 YAML
    const yamlContent = `title: "${selectedTrack.trackName}"
artist: "${selectedTrack.artistName}"
coverImage: "../../assets/music/${coverFilename}"
pubDate: ${new Date().toISOString().split('T')[0]}
links:
  spotify: "${spotifyLink}"
  netease: "${neteaseLink}"
  qqMusic: "${qqLink}"
`;
    
    const yamlFileName = `${safeTitle}.yaml`;
    await fs.writeFile(path.join(PATHS.musicContent, yamlFileName), yamlContent);

    console.log(`\n✅ 音乐档案已创建: src/content/music/${yamlFileName}`);
    console.log(`🔗 链接已自动填入`);

  } catch (error) {
    console.error('❌ 发生异常:', error);
  }
}

main().catch(console.error);