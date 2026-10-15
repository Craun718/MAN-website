# Rspress website

这里是[MAN](https://github.com/duorua/narutomobile)的文档站源码。

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get started

Start the dev server:

```bash
pnpm run dev
```

Build the website for production:

```bash
pnpm run build
```

Preview the production build locally:

```bash
pnpm run preview
```

## Sync documentation

Sync the latest documentation from `duorua/narutomobile`:

```bash
pnpm run sync:docs
```

The `Sync MAN docs` GitHub Actions workflow runs this command every day at
02:10 UTC (10:10 Asia/Shanghai), commits changes to the repository, and
triggers the Pages deployment.
