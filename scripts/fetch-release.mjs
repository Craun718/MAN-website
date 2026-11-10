import { mkdir, writeFile } from 'node:fs/promises';

const origin = 'https://github.com';
const repository = '/duorua/narutomobile';

async function getPage(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

async function getApiRelease() {
  const response = await fetch(
    `https://api.github.com/repos${repository}/releases/latest`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'MAN-website',
      },
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  const release = await response.json();
  if (
    typeof release.tag_name !== 'string' ||
    !release.tag_name ||
    !Array.isArray(release.assets) ||
    !release.assets.length
  ) {
    throw new Error('GitHub API returned invalid release data');
  }
  const assets = release.assets.map(({ name, browser_download_url, size }) => ({
    name,
    browser_download_url,
    size,
  }));
  if (
    assets.some(
      (asset) =>
        typeof asset.name !== 'string' ||
        !asset.name ||
        typeof asset.browser_download_url !== 'string' ||
        !asset.browser_download_url ||
        typeof asset.size !== 'number',
    )
  ) {
    throw new Error('GitHub API returned invalid release assets');
  }
  return { tag_name: release.tag_name, assets };
}

async function getPageRelease() {
  const page = await getPage(`${origin}${repository}/releases/latest`);
  const fragment = page.match(
    /<include-fragment\b[^>]*\bsrc="([^"]*\/releases\/expanded_assets\/[^"?#]+)"/i,
  )?.[1];
  if (!fragment) throw new Error('Release assets fragment not found');
  const fragmentUrl = new URL(fragment, origin);
  if (
    fragmentUrl.origin !== origin ||
    !fragmentUrl.pathname.startsWith(`${repository}/releases/expanded_assets/`)
  ) {
    throw new Error('Unexpected release assets URL');
  }
  const tag = fragmentUrl.pathname.slice(
    `${repository}/releases/expanded_assets/`.length,
  );
  const html = await getPage(fragmentUrl);
  const assets = [];
  for (const row of html.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/gi)) {
    const href = row[0].match(/<a\b[^>]*\bhref="([^"]+)"/i)?.[1];
    if (!href) continue;
    const url = new URL(href, origin);
    const prefix = `${repository}/releases/download/${tag}/`;
    if (
      url.origin !== origin ||
      !url.pathname.startsWith(prefix) ||
      url.search ||
      url.hash
    )
      continue;
    const name = decodeURIComponent(url.pathname.slice(prefix.length));
    if (!name || name.includes('/')) continue;
    const size = row[0].match(/>\s*(\d+(?:\.\d+)?)\s*(bytes|KB|MB|GB|TB)\s*</i);
    const units = {
      bytes: 1,
      kb: 1024,
      mb: 1024 ** 2,
      gb: 1024 ** 3,
      tb: 1024 ** 4,
    };
    assets.push({
      name,
      browser_download_url: url.href,
      ...(size && {
        size: Math.round(Number(size[1]) * units[size[2].toLowerCase()]),
      }),
    });
  }
  if (!assets.length) throw new Error('No release assets found');
  return { tag_name: decodeURIComponent(tag), assets };
}

let release;
try {
  release = await getApiRelease();
  console.log('Fetched release data from GitHub API');
} catch (error) {
  console.warn(
    `GitHub API unavailable (${error.message}); falling back to release page`,
  );
  release = await getPageRelease();
}
await mkdir('.generated', { recursive: true });
await writeFile('.generated/release-data.json', JSON.stringify(release));
console.log(`Fetched ${release.assets.length} assets for ${release.tag_name}`);
