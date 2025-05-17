# Nuxt 3 の基礎ガイド

## Nuxt の役割

- Vue の拡張フレームワーク。ページルーティングやレイアウト管理が自動化。

## ディレクトリ構成

- `pages/`：ページごとに自動でルーティング。
- `layouts/`：全体や一部ページの共通レイアウト。
- `components/`：再利用可能な UI 部品。

## ページ自動ルーティング

- `pages/index.vue` → `/`（トップページ）
- `pages/about.vue` → `/about` など

## レイアウト

- `layouts/default.vue`：全ページ共通の枠組み。
- `<slot />` でページごとの内容を差し込む。

## 参考リンク

- [Nuxt 3 公式ガイド](https://nuxt.com/docs/getting-started/introduction)
