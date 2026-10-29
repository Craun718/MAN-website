import { Layout as DefaultLayout } from '@rspress/core/theme-original';
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

export function Layout() {
  return <DefaultLayout afterFeatures={<HomeSections />} />;
}
