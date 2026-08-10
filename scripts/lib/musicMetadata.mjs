import slugify from "slugify";
import { pinyin } from "pinyin-pro";

const DEFAULT_STORES = [
  { country: "CN", lang: "zh_cn" },
  { country: "HK", lang: "zh_hk" },
  { country: "TW", lang: "zh_tw" },
  { country: "JP", lang: "ja_jp" },
  { country: "KR", lang: "ko_kr" },
  { country: "US", lang: "en_us" },
];

const KANA = new Map(Object.entries({
  ア:"a",イ:"i",ウ:"u",エ:"e",オ:"o",カ:"ka",キ:"ki",ク:"ku",ケ:"ke",コ:"ko",サ:"sa",シ:"shi",ス:"su",セ:"se",ソ:"so",タ:"ta",チ:"chi",ツ:"tsu",テ:"te",ト:"to",ナ:"na",ニ:"ni",ヌ:"nu",ネ:"ne",ノ:"no",ハ:"ha",ヒ:"hi",フ:"fu",ヘ:"he",ホ:"ho",マ:"ma",ミ:"mi",ム:"mu",メ:"me",モ:"mo",ヤ:"ya",ユ:"yu",ヨ:"yo",ラ:"ra",リ:"ri",ル:"ru",レ:"re",ロ:"ro",ワ:"wa",ヲ:"o",ン:"n",ガ:"ga",ギ:"gi",グ:"gu",ゲ:"ge",ゴ:"go",ザ:"za",ジ:"ji",ズ:"zu",ゼ:"ze",ゾ:"zo",ダ:"da",ヂ:"ji",ヅ:"zu",デ:"de",ド:"do",バ:"ba",ビ:"bi",ブ:"bu",ベ:"be",ボ:"bo",パ:"pa",ピ:"pi",プ:"pu",ペ:"pe",ポ:"po",ャ:"ya",ュ:"yu",ョ:"yo",ッ:"",ー:"",
}));

function detectScript(text) {
  if (/\p{Script=Hangul}/u.test(text)) return "ko";
  if (/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text)) return "ja";
  if (/\p{Script=Han}/u.test(text)) return "zh";
  return "latin";
}

export function storefrontsFor(query) {
  const script = detectScript(query);
  const preferred = script === "ja" ? "JP" : script === "ko" ? "KR" : undefined;
  return preferred
    ? [...DEFAULT_STORES].sort((a, b) => (a.country === preferred ? -1 : b.country === preferred ? 1 : 0))
    : DEFAULT_STORES;
}

function normalize(value) {
  return value.normalize("NFKC").toLocaleLowerCase("en-US").replace(/[\p{P}\p{S}\s]+/gu, "");
}

export function metadataScore(result, title, artist) {
  const resultTitle = normalize(result.trackName ?? result.collectionName ?? "");
  const resultArtist = normalize(result.artistName ?? "");
  const wantedTitle = normalize(title);
  const wantedArtist = normalize(artist);
  let score = 0;
  if (resultTitle === wantedTitle) score += 6;
  else if (resultTitle.includes(wantedTitle) || wantedTitle.includes(resultTitle)) score += 3;
  if (resultArtist === wantedArtist) score += 4;
  else if (resultArtist.includes(wantedArtist) || wantedArtist.includes(resultArtist)) score += 2;
  return score;
}

export async function searchItunes(fetchJson, { query, entity, limit = 5 }) {
  const seen = new Set();
  const results = [];
  let successfulStores = 0;
  let lastError;
  for (const store of storefrontsFor(query)) {
    const url = new URL("https://itunes.apple.com/search");
    url.searchParams.set("term", query);
    url.searchParams.set(entity === "album" ? "entity" : "media", entity === "album" ? "album" : "music");
    url.searchParams.set("country", store.country);
    url.searchParams.set("lang", store.lang);
    url.searchParams.set("limit", String(limit));
    let data;
    try {
      data = await fetchJson(url.toString());
      successfulStores += 1;
    } catch (error) {
      lastError = error;
      continue;
    }
    for (const result of data.results ?? []) {
      const id = result.trackId ?? result.collectionId;
      if (id === undefined) continue;
      if (seen.has(id)) {
        const existing = results.find((item) => (item.trackId ?? item.collectionId) === id);
        if (existing && !existing.storefronts.includes(store.country)) {
          existing.storefronts.push(store.country);
        }
        continue;
      }
      seen.add(id);
      results.push({ ...result, storefront: store.country, storefronts: [store.country] });
    }
  }
  if (successfulStores === 0 && lastError) throw lastError;
  return results;
}

export async function fetchAlbumTracks(fetchJson, selectedAlbum, searchResults) {
  const matchingAlbums = searchResults
    .map((album) => ({
      album,
      score: metadataScore(album, selectedAlbum.collectionName, selectedAlbum.artistName),
    }))
    .filter(({ score }) => score >= 7)
    .sort((a, b) => {
      const aSelected = a.album.collectionId === selectedAlbum.collectionId;
      const bSelected = b.album.collectionId === selectedAlbum.collectionId;
      return Number(bSelected) - Number(aSelected) || b.score - a.score;
    });
  const attempts = [];

  for (const { album } of matchingAlbums) {
    const storefronts = [
      album.storefront,
      ...(album.storefronts ?? []),
      ...storefrontsFor(`${album.collectionName} ${album.artistName}`)
        .map((store) => store.country),
    ]
      .filter((country, index, values) => values.indexOf(country) === index);
    for (const storefront of storefronts) {
      const lookupUrl = `https://itunes.apple.com/lookup?id=${album.collectionId}&entity=song&country=${storefront}`;
      attempts.push(`${storefront}:${album.collectionId}`);
      try {
        const lookupData = await fetchJson(lookupUrl);
        let tracks = (lookupData.results ?? [])
          .filter((item) => item.wrapperType === "track")
          .sort((a, b) => a.trackNumber - b.trackNumber);
        if (tracks.length === 0) {
          const searchUrl = new URL("https://itunes.apple.com/search");
          searchUrl.searchParams.set("term", `${album.collectionName} ${album.artistName}`);
          searchUrl.searchParams.set("entity", "song");
          searchUrl.searchParams.set("country", storefront);
          searchUrl.searchParams.set("limit", "200");
          const searchData = await fetchJson(searchUrl.toString());
          tracks = (searchData.results ?? [])
            .filter((item) =>
              item.wrapperType === "track" &&
              item.collectionId === album.collectionId
            )
            .sort((a, b) => a.trackNumber - b.trackNumber);
        }
        if (tracks.length > 0) return { album, storefront, tracks };
      } catch {
        // A failed storefront must not prevent trying the remaining candidates.
      }
    }
  }

  throw new Error(
    `Album metadata was found, but Apple returned no tracks after trying ${attempts.join(", ")}.`,
  );
}

function romanizeHangul(text) {
  const initial = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
  const medial = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
  const final = ["","k","k","ks","n","nj","nh","t","l","lk","lm","lb","ls","lt","lp","lh","m","p","ps","t","t","ng","t","t","k","t","p","h"];
  return [...text].map((char) => {
    const code = char.codePointAt(0);
    if (code < 0xac00 || code > 0xd7a3) return char;
    const offset = code - 0xac00;
    return initial[Math.floor(offset / 588)] + medial[Math.floor((offset % 588) / 28)] + final[offset % 28];
  }).join(" ");
}

function romanizeKana(text) {
  const katakana = [...text.normalize("NFKC")].map((char) => {
    const code = char.codePointAt(0);
    return code >= 0x3041 && code <= 0x3096 ? String.fromCodePoint(code + 0x60) : char;
  });
  return katakana.map((char) => KANA.get(char) ?? char).join(" ");
}

export function generateMusicSlug(text, stableId, storefront) {
  const clean = text.replace(/（.*?）|\(.*?\)/g, "").replace(/\s(?:feat|ft)\.?\s.*/i, "").trim();
  const script = storefront === "JP" ? "ja" : storefront === "KR" ? "ko" : detectScript(clean);
  const transliterated = script === "ko"
    ? romanizeHangul(clean)
    : script === "ja"
      ? romanizeKana(clean)
      : script === "zh"
        ? pinyin(clean, { toneType: "none", type: "array", v: true }).join("-")
        : clean;
  let base = slugify(transliterated, { lower: true, strict: true });
  if (base.length > 40) base = base.slice(0, 40).replace(/-$/, "");
  const fallback = stableId ? `track-${stableId}` : "unnamed-track";
  return base || fallback;
}
