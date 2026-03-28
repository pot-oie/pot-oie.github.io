import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import slugify from "slugify";
import { fileURLToPath } from "url";
import { pinyin } from "pinyin-pro";
import {
  intro,
  outro,
  select,
  text,
  confirm,
  spinner,
  isCancel,
  cancel,
} from "@clack/prompts";
import color from "picocolors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, "..");

const PATHS = {
  musicContent: path.join(PROJECT_ROOT, "src/content/music"),
  musicAssets: path.join(PROJECT_ROOT, "src/assets/music"),
};

// 确保基础目录存在
Object.values(PATHS).forEach((p) => fs.ensureDirSync(p));

// ================= 辅助函数 =================
function checkCancel(value) {
  if (isCancel(value)) {
    cancel(color.dim("Operation cancelled by user."));
    process.exit(0);
  }
}

// 转拼音 Slug 工具
function generateSlug(text) {
  let cleanText = text
    .replace(/\（.*?\）/g, "")
    .replace(/\(.*?\)/g, "")
    .trim();
  const pinyinArray = pinyin(cleanText, {
    toneType: "none",
    type: "array",
    v: true,
  });
  let pinyinSlug = slugify(pinyinArray.join("-"), {
    lower: true,
    strict: true,
  });
  return pinyinSlug.length > 40
    ? pinyinSlug.slice(0, 40).replace(/-$/, "")
    : pinyinSlug || "unnamed";
}

// ================= 专辑抓取逻辑 =================
async function handleAlbum() {
  console.clear();
  intro(color.bgBlue(color.bold(color.white("  ALBUM SCRAPER  "))));

  // 1. 输入专辑名称
  const query = await text({
    message: "Album + Artist:",
    placeholder: "e.g. 范特西 周杰伦",
    validate(value) {
      if (value.length === 0) return "Input required";
    },
  });
  checkCancel(query);

  // === 设置地区 ===
  const STORE_REGION = "HK"; // 换成 'TW' 也可以
  const STORE_LANG = "zh_hk"; // 换成 'zh_tw' 也可以
  // ===================================

  const s = spinner();
  s.start(color.blue(`› Searching iTunes Albums (${STORE_REGION})...`));

  // 第一步：搜索专辑 (使用变量)
  const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&country=${STORE_REGION}&lang=${STORE_LANG}&limit=5`;

  try {
    const res = await fetch(searchUrl);
    const data = await res.json();
    s.stop(color.dim("Album search complete"));

    if (data.resultCount === 0) {
      cancel(color.yellow(`No albums found in ${STORE_REGION} region.`));
      process.exit(0);
    }

    const options = data.results.map((album) => {
      const year = album.releaseDate ? album.releaseDate.split("-")[0] : "";
      return {
        value: album,
        label: `${album.collectionName} - ${album.artistName}`,
        hint: `${album.trackCount} tracks (${year})`,
      };
    });

    // 2. 选择专辑
    const selectedAlbum = await select({
      message: "Select an album:",
      options: options,
    });
    checkCancel(selectedAlbum);

    // 3. 根据 collectionId 获取专辑下所有曲目 (使用变量)
    s.start(color.blue("› Fetching tracklist..."));
    const lookupUrl = `https://itunes.apple.com/lookup?id=${selectedAlbum.collectionId}&entity=song&country=${STORE_REGION}&lang=${STORE_LANG}`;

    const lookupRes = await fetch(lookupUrl);
    const lookupData = await lookupRes.json();

    const tracks = lookupData.results
      .filter((item) => item.wrapperType === "track")
      .sort((a, b) => a.trackNumber - b.trackNumber);

    s.stop(color.dim(`Fetched ${tracks.length} tracks`));

    if (tracks.length === 0) {
      console.log(color.red(`\nError: API 返回了 0 首歌。`));
      console.log(
        color.yellow(
          `请在浏览器中打开此链接查看苹果的原始数据:\n${lookupUrl}\n`,
        ),
      );
      process.exit(1);
    }

    // 4. 准备目录结构
    const albumSlug = generateSlug(selectedAlbum.collectionName);
    const albumContentDir = path.join(PATHS.musicContent, albumSlug);
    const albumAssetsDir = path.join(PATHS.musicAssets, albumSlug);

    fs.ensureDirSync(albumContentDir);
    fs.ensureDirSync(albumAssetsDir);

    // 5. 下载高精度专辑封面 (整张专辑只需下载一次)
    s.start(color.blue("› Downloading HD cover art..."));
    const highResUrl = selectedAlbum.artworkUrl100.replace(
      "100x100bb",
      "1000x1000bb",
    );
    const coverFilename = "cover.jpg";
    const coverPath = path.join(albumAssetsDir, coverFilename);

    const imgRes = await fetch(highResUrl);
    const buffer = await imgRes.arrayBuffer();
    await fs.writeFile(coverPath, Buffer.from(buffer));
    s.stop(color.dim(`Cover saved to ${albumSlug}/cover.jpg`));

    // 6. 循环生成每首歌的 YAML
    s.start(color.green("› Generating YAML files & Collecting track IDs..."));
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // 用于存储生成的 MDX 正文内容
    let mdxTrackList = "";

    for (const track of tracks) {
      const rawName =
        track.trackName || track.trackCensoredName || "Unknown Track";
      const trackSlug = generateSlug(rawName);

      const trackNum = track.trackNumber;
      const trackNumberFormatted = String(trackNum).padStart(2, "0");

      const yamlFileName = `${trackNumberFormatted}-${trackSlug}.yaml`;
      const yamlPath = path.join(albumContentDir, yamlFileName);

      // 构建用于 MDX 的 trackId (不带后缀，带专辑子目录)
      const trackId = `${albumSlug}/${trackNumberFormatted}-${trackSlug}`;

      const artistsName =
        track.artistName || selectedAlbum.artistName || "Unknown Artist";
      const searchKey = `${rawName} ${artistsName}`;

      const spotifyLink = track.external_urls?.spotify || "";
      const neteaseLink = `https://music.163.com/#/search/m/?s=${encodeURIComponent(searchKey)}`;
      const qqLink = `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(searchKey)}`;
      const previewUrl = track.previewUrl || "";

      const yamlContent = `title: "${rawName}"
artist: "${artistsName}"
album: "${selectedAlbum.collectionName}"
trackNumber: ${trackNum}
coverImage: "../../../assets/music/${albumSlug}/cover.jpg"
pubDate: ${todayStr}
audioPreview: "${previewUrl}"
links:
  spotify: "${spotifyLink}"
  netease: "${neteaseLink}"
  qqMusic: "${qqLink}"
`;
      await fs.writeFile(yamlPath, yamlContent);

      // 动态拼接 MDX 内容行
      mdxTrackList += `### ${trackNumberFormatted}. ${rawName} <TrackControl trackId="${trackId}" />\n\n`;
      mdxTrackList += `<ScoreBox score={0.0} label="单曲评分" />\n\n`; // 预留评分组件
    }

    // 7. 生成 MDX 文章草稿
    s.message(color.green("› Creating MDX draft..."));
    const blogPath = path.join(
      PROJECT_ROOT,
      "src/content/blog",
      `${albumSlug}.mdx`,
    );

    const mdxContent = `---
title: "《${selectedAlbum.collectionName}》"
description: "在这里输入专辑简评..."
pubDate: "${todayStr}"
category: "life"
lifeCategory: "album"
heroImage: "../../assets/music/${albumSlug}/cover.jpg"
albumTitle: "${selectedAlbum.collectionName}"
albumArtist: "${selectedAlbum.artistName}"
---
import TrackControl from "../../components/TrackControl.astro";
import ScoreBox from "../../components/ScoreBox.astro";

<ScoreBox score={0.0} label="整专表现" />

${mdxTrackList}`;

    await fs.writeFile(blogPath, mdxContent);
    s.stop(color.green("✔ YAMLs & MDX draft generated successfully"));

    console.log();
    console.log(
      color.cyan(
        `  MDX Article:  ${color.underline("src/content/blog/" + albumSlug + ".mdx")}`,
      ),
    );
    console.log(color.cyan(`  Album Folder:  ${color.underline(albumSlug)}`));
    console.log(color.cyan(`  Total Tracks:  ${tracks.length}`));
    console.log();

    outro(color.green("Album scraping complete!"));
  } catch (error) {
    s.stop(color.red("Error occurred"));
    console.error(error);
  }
}

handleAlbum();
