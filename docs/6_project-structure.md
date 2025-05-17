# プロジェクト固有の構成ガイド

## ディレクトリの役割

- `components/layout/`：ヘッダー・フッター・サイドバーなど共通 UI 部品
- `layouts/default.vue`：全ページ共通のレイアウト
- `pages/`：各ページの実装（自動ルーティング）
- `assets/css/main.css`：Tailwind のエントリーポイント
- `tailwind.config.js`：Tailwind の設定ファイル

## 主要ファイルの例

- `components/layout/Header.vue`：ヘッダー UI
- `components/layout/Footer.vue`：フッター UI
- `components/layout/Sidebar.vue`：サイドバー UI
- `layouts/default.vue`：全体レイアウト
- `pages/index.vue`：トップページ

## 参考リンク

- [Nuxt 3 ディレクトリ構成](https://nuxt.com/docs/guide/directory-structure/nuxt)
