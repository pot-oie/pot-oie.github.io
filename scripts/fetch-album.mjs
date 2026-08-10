import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import {
  fetchAlbumTracks,
  generateMusicSlug,
  searchItunes,
} from "./lib/musicMetadata.mjs";
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
  albumContent: path.join(PROJECT_ROOT, "src/content/albums"),
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

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);
  return response.json();
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

  const s = spinner();
  s.start(color.blue("› Searching iTunes Albums (CN / HK / TW / JP / KR / US)..."));

  try {
    const results = await searchItunes(fetchJson, { query, entity: "album", limit: 5 });
    s.stop(color.dim("Album search complete"));

    if (results.length === 0) {
      cancel(color.yellow("No albums found in the supported storefronts."));
      process.exit(0);
    }

    const options = results.map((album) => {
      const year = album.releaseDate ? album.releaseDate.split("-")[0] : "";
      return {
        value: album,
        label: `${album.collectionName} - ${album.artistName}`,
        hint: `${album.storefront} · ${album.trackCount} tracks (${year})`,
      };
    });

    // 2. 选择专辑
    let selectedAlbum = await select({
      message: "Select an album:",
      options: options,
      maxItems: 8,
    });
    checkCancel(selectedAlbum);

    // 3. 用完整专辑名和艺人补搜 regional collection ID，再执行跨区 lookup。
    s.start(color.blue("› Fetching tracklist across storefronts..."));
    const preciseResults = await searchItunes(fetchJson, {
      query: `${selectedAlbum.collectionName} ${selectedAlbum.artistName}`,
      entity: "album",
      limit: 20,
    });
    const resolvedAlbum = await fetchAlbumTracks(
      fetchJson,
      selectedAlbum,
      [...results, ...preciseResults],
    );
    selectedAlbum = {
      ...resolvedAlbum.album,
      storefront: resolvedAlbum.storefront,
    };
    const tracks = resolvedAlbum.tracks;
    s.stop(color.dim(`Fetched ${tracks.length} tracks (${resolvedAlbum.storefront})`));

    // 4. 准备目录结构
    const albumSlug = generateMusicSlug(
      selectedAlbum.collectionName,
      selectedAlbum.collectionId,
      selectedAlbum.storefront,
    );
    const albumContentDir = path.join(PATHS.musicContent, albumSlug);
    const albumAssetsDir = path.join(PATHS.musicAssets, albumSlug);
    const albumEntityPath = path.join(PATHS.albumContent, `${albumSlug}.yaml`);

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
    const releaseDate = selectedAlbum.releaseDate?.split("T")[0] ?? todayStr;

    const albumContent = `title: "${selectedAlbum.collectionName}"
artist: "${selectedAlbum.artistName}"
coverImage: "../../assets/music/${albumSlug}/cover.jpg"
releaseDate: ${releaseDate}
`;
    await fs.writeFile(albumEntityPath, albumContent);

    // 用于存储生成的 MDX 正文内容
    let mdxTrackList = "";

    for (const track of tracks) {
      const rawName =
        track.trackName || track.trackCensoredName || "Unknown Track";
      const trackSlug = generateMusicSlug(
        rawName,
        track.trackId,
        selectedAlbum.storefront,
      );

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
albumId: "${albumSlug}"
trackNumber: ${trackNum}
recordedAt: ${todayStr}
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
albumId: "${albumSlug}"
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
