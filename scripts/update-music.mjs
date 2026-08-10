import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import color from 'picocolors';
import { metadataScore, searchItunes } from './lib/musicMetadata.mjs';

dotenv.config();

// 复用你的代理配置
const PROXY_URL = process.env.PROXY_URL || 'http://127.0.0.1:7890';
const agent = new HttpsProxyAgent(PROXY_URL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 如果你的脚本放在项目根目录，这里可以直接用 __dirname。如果在 scripts 文件夹，保留 '..'
const PROJECT_ROOT = path.join(__dirname, '..'); 
const MUSIC_DIR = path.join(PROJECT_ROOT, 'src/content/music');

async function fetchJson(url) {
  const response = await fetch(url, { agent });
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);
  return response.json();
}

async function main() {
  console.clear();
  console.log(color.bgBlue(color.bold(color.white('  MUSIC BATCH UPDATER  '))) + '\n');

  try {
    const files = await fs.readdir(MUSIC_DIR, { recursive: true });
    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.mdx') || f.endsWith('.md'));
    
    if (yamlFiles.length === 0) {
      console.log(color.yellow('No music files found.'));
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const file of yamlFiles) {
      const filePath = path.join(MUSIC_DIR, file);
      let content = await fs.readFile(filePath, 'utf-8');

      // 1. 如果已经存在 audioPreview，说明更新过了或本身就有，跳过
      if (content.includes('audioPreview:')) {
        skippedCount++;
        continue;
      }

      // 2. 正则提取 title 和 artist (支持带引号和不带引号的 YAML 写法)
      const titleMatch = content.match(/title:\s*["']?(.*?)["']?$/m);
      const artistMatch = content.match(/artist:\s*["']?(.*?)["']?$/m);

      if (titleMatch && artistMatch) {
        const title = titleMatch[1];
        const artist = artistMatch[1];
        const query = `${title} ${artist}`;

        process.stdout.write(color.dim(`› Searching preview for `) + color.cyan(`${title} - ${artist}... `));

        try {
          const results = await searchItunes(fetchJson, { query, entity: 'song', limit: 5 });
          const matches = results
            .filter((result) => result.previewUrl)
            .map((result) => ({ result, score: metadataScore(result, title, artist) }))
            .sort((a, b) => b.score - a.score);
          const best = matches[0];

          if (best && best.score >= 7) {
            const previewUrl = best.result.previewUrl;
            
            // 4. 将 audioPreview 插入到 recordedAt 所在行的下方
            content = content.replace(/^(recordedAt:.*)$/m, `$1\naudioPreview: "${previewUrl}"`);
            
            await fs.writeFile(filePath, content);
            console.log(color.green(`✔ Updated (${best.result.storefront})`));
            updatedCount++;
          } else {
            console.log(color.yellow('⚠ No reliable preview match found'));
            failedCount++;
          }
        } catch (fetchErr) {
          console.log(color.red('✖ Network Error'));
          failedCount++;
        }
      } else {
        console.log(color.yellow(`⚠ Skipped ${file} (Missing title or artist)`));
        skippedCount++;
      }
    }

    // 总结报告
    console.log('\n' + color.dim('─'.repeat(40)));
    console.log(color.bold('TASK COMPLETE'));
    console.log(`Updated: ${color.green(updatedCount)}`);
    console.log(`Skipped: ${color.dim(skippedCount)}`);
    console.log(`Failed:  ${color.red(failedCount)}`);
    console.log(color.dim('─'.repeat(40)) + '\n');

  } catch (error) {
    console.error(color.red('Error reading directory:'), error);
  }
}

main();
