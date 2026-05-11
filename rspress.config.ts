import * as path from 'node:path';
import {defineConfig} from '@rspress/core';
import {pluginLess} from '@rsbuild/plugin-less';
import alignImage from 'rspress-plugin-align-image';
import readingTime from 'rspress-plugin-reading-time';
import toc from 'rspress-plugin-toc';

export default defineConfig({
    root: path.join(__dirname, 'docs'),
    title: 'Maa Auto Naruto',
    icon: '/logo.ico',
    plugins: [alignImage(), readingTime({
        defaultLocale: 'zh-CN',
    }), toc()],
    logo: {
        light: '/nav-logo-light.png',
        dark: '/nav-logo-dark.png',
    },
    themeConfig: {
        socialLinks: [
            {
                icon: 'github',
                mode: 'link',
                content: 'https://github.com/duorua/narutomobile',
            },
        ],
        enableScrollToTop: true, // 是否启用回到顶部按钮,
        enableContentAnimation: true, // 是否启用内容动画
        enableAppearanceAnimation: true, // 是否启用外观动画
        lastUpdated: true, // 是否启用页面更新时间
    },
    builderConfig: {
        plugins: [pluginLess()],
    },
});