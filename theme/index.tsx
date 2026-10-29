import { Button, HomeLayout as DefaultHomeLayout, Layout as DefaultLayout, type HomeLayoutProps } from '@rspress/core/theme-original';
import { useEffect, useState } from 'react';
import startupImage from '../docs/imgs/startup.png';
import './home.css';

export * from '@rspress/core/theme-original';

// 首页扩展内容：直接修改下面的标题、文字、链接和图片即可。
const platforms = [
  { name: 'Windows', description: '模拟器版' },
  { name: 'macOS', description: '模拟器版' },
  { name: 'Linux', description: '模拟器版' },
  { name: 'Android', description: '实机独立运行' },
];

type ReleaseAsset = { name: string; size?: number; browser_download_url: string };
type Release = { tag_name: string; published_at: string; assets: ReleaseAsset[] };
type Platform = 'Windows' | 'macOS' | 'Linux' | 'Android';

const releasePage = 'https://github.com/duorua/narutomobile/releases/latest';
// Keep a known release available when the GitHub API is slow or unreachable.
const fallbackTag = 'v1.4.8';
const fallbackAssets: ReleaseAsset[] = [
  'android-public-release-amd64',
  'android-public-release-arm64',
  'linux-aarch64',
  'linux-x86_64',
  'macos-aarch64',
  'macos-x86_64',
  'win-aarch64',
  'win-x86_64',
].map((build) => {
  const extension = build.startsWith('android') ? 'apk' : build.startsWith('win') ? 'zip' : 'tar.gz';
  const name = `MaaAutoNaruto-${build}-${fallbackTag}.${extension}`;
  return { name, browser_download_url: `https://github.com/duorua/narutomobile/releases/download/${fallbackTag}/${name}` };
});

function assetPlatform(name: string): Platform | undefined {
  if (name.includes('-android-') && name.endsWith('.apk')) return 'Android';
  if (name.includes('-win-') && name.endsWith('.zip')) return 'Windows';
  if (name.includes('-macos-') && name.endsWith('.tar.gz')) return 'macOS';
  if (name.includes('-linux-') && name.endsWith('.tar.gz')) return 'Linux';
}

function architecture(name: string) {
  return /aarch64|arm64/i.test(name) ? 'ARM64' : /x86_64|amd64/i.test(name) ? 'x64' : '';
}

function DownloadSection() {
  const [release, setRelease] = useState<Release | null>(null);
  const [platform, setPlatform] = useState<Platform>('Windows');

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) setPlatform('Android');
    else if (/Macintosh|Mac OS X/i.test(ua)) setPlatform('macOS');
    else if (/Linux/i.test(ua)) setPlatform('Linux');

    const controller = new AbortController();
    fetch('https://api.github.com/repos/duorua/narutomobile/releases/latest', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Release unavailable');
        return response.json();
      })
      .then((data: Release) => setRelease(data))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const latestAssets = release?.assets.filter((asset) => assetPlatform(asset.name)) ?? [];
  const assets = latestAssets.length ? latestAssets : fallbackAssets;
  // Architecture cannot reliably be inferred from the browser; use a common default and expose every build.
  const preferredArch = platform === 'Android' || platform === 'macOS' ? 'ARM64' : 'x64';
  const selected = assets.find((asset) => assetPlatform(asset.name) === platform && architecture(asset.name) === preferredArch)
    ?? fallbackAssets.find((asset) => assetPlatform(asset.name) === platform && architecture(asset.name) === preferredArch);

  return (
    <div className="man-hero-actions">
          <div className="man-download-split">
            <a className="man-download-primary" href={selected?.browser_download_url ?? releasePage}>
              <svg className="man-download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
              <span>{selected ? `下载 ${platform} ${preferredArch}` : '前往 GitHub 下载'}</span>
              {selected?.size != null && <small>{(selected.size / 1024 / 1024).toFixed(1)} MB</small>}
              {selected && fallbackAssets.includes(selected) && <small>{fallbackTag}</small>}
            </a>
            <details className="man-download-dropdown" onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.currentTarget.open = false;
                event.currentTarget.querySelector('summary')?.focus();
              }
            }}>
              <summary aria-label="选择其他平台和架构"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></summary>
              <div className="man-download-menu">
                <div className="man-download-menu-title">选择其他版本</div>
                {assets.length ? assets.map((asset) => <a key={asset.name} href={asset.browser_download_url}>
                  <span>{assetPlatform(asset.name)} <small>{architecture(asset.name)}{fallbackAssets.includes(asset) ? ` · ${fallbackTag}` : ''}</small></span>
                  {asset.size != null && <span>{(asset.size / 1024 / 1024).toFixed(1)} MB</span>}
                </a>) : <a href={releasePage}>前往 GitHub 查看所有版本 ↗</a>}
                <a className="man-download-history" href="https://github.com/duorua/narutomobile/releases">查看历史版本 ↗</a>
              </div>
            </details>
          </div>
      <Button type="a" theme="alt" href="/guide/">快速开始</Button>
      <Button type="a" theme="alt" href="https://github.com/duorua/narutomobile">GitHub</Button>
    </div>
  );
}

function HomeSections() {
  return (
    <div className="man-home-sections">
      <section className="man-home-section man-home-split">
        <div>
          <span className="man-home-label">界面展示</span>
          <h2>运行状态，一目了然</h2>
          <p>任务进度和运行状况实时展示。</p>
          <a href="/guide/">了解如何使用 →</a>
        </div>
        {/* 将 src 替换为你的软件截图，例如 /screenshots/home.png。 */}
        <div className="man-home-image"><img src={startupImage} alt="MaaAutoNaruto 软件界面示例" /></div>
      </section>

      <section className="man-home-section">
        <span className="man-home-label">跨平台支持</span>
        <h2>在你喜欢的平台上使用</h2>
        <p>支持 Windows、macOS、Linux 和 Android。</p>
        <div className="man-home-platforms">
          {platforms.map((platform) => (
            <div className="man-home-card" key={platform.name}>
              <h3>{platform.name}</h3>
              <p className={platform.name === 'Android' ? 'man-home-platform-highlight' : undefined}>
                {platform.description}
              </p>
            </div>
          ))}
        </div>
        <a href="/guide/">查看完整入门指南 →</a>
      </section>

      <section className="man-home-section man-home-split man-home-split-reverse">
        <div>
          <span className="man-home-label">功能介绍</span>
          <h2>把时间留给更有趣的事</h2>
          <p>在这里介绍支持的日常任务、战斗玩法或活动，并补充你想重点展示的内容。</p>
          <a href="/guide/#主要功能">查看主要功能 →</a>
        </div>
        {/* 这里也可以替换成任务列表或功能截图。 */}
        <div className="man-home-example">
          <div className="man-home-example-title">任务清单 <span>示例</span></div>
          <div>✓ <span>日常任务</span></div>
          <div>✓ <span>副本挑战</span></div>
          <div>✓ <span>活动任务</span></div>
        </div>
      </section>

      <section className="man-home-section man-home-community">
        <span className="man-home-label">一起参与</span>
        <h2>遇到问题？想参与建设？</h2>
        <p>阅读常见问题，或者前往 GitHub 了解项目和参与贡献。</p>
        <div className="man-home-links">
          <a href="/guide/faq">常见问题 →</a>
          <a href="/develop/">开发文档 →</a>
          <a href="https://github.com/duorua/narutomobile">GitHub →</a>
        </div>
      </section>
    </div>
  );
}

function HomeLayout(props: HomeLayoutProps) {
  return <DefaultHomeLayout {...props} beforeHeroActions={<DownloadSection />} />;
}

export function Layout() {
  return <DefaultLayout HomeLayout={HomeLayout} afterFeatures={<HomeSections />} />;
}
