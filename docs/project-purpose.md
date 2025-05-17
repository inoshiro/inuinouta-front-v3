# プロジェクト目的と開発ガイド

## プロジェクト概要

本プロジェクトは、バーチャルライバー戌亥とこの歌動画を快適に視聴・管理できる Web サービス「いぬいのうた」のフロントエンドを、最新の Nuxt3（TypeScript, Vite, Composition API, Tailwind CSS 等）で再構築するものです。

- **バックエンド**: Django + Django REST Framework（`inuinouta` リポジトリ）
- **旧フロントエンド**: Nuxt2（`inuinouta-front` リポジトリ）
- **新フロントエンド**: Nuxt3（本プロジェクト, `inuinouta-front-v3` リポジトリ）

## 主要なデータ構造

Django REST API から取得する主なデータ:

- **Channel**: チャンネル情報（name, url, ...）
- **Video**: 動画情報（id, channel, title, url, is_open, is_member_only, is_stream, published_at, ...）
- **Song**: 楽曲情報（video, title, artist, is_original, start_at, end_at, ...）

## 開発ガイド

- **API 連携**: バックエンドの REST API エンドポイントを fetch/axios 等で呼び出し、データを取得・表示します。
- **型定義**: API レスポンスの型は TypeScript で定義し、型安全な開発を推奨します。
- **UI/UX**: Tailwind CSS を活用し、レスポンシブかつモダンな UI を目指します。
- **ディレクトリ構成**:
  - `components/` ... 再利用可能な Vue コンポーネント
  - `pages/` ... ルーティングされるページ
  - `layouts/` ... 共通レイアウト
  - `assets/` ... 静的アセット（CSS 等）
  - `docs/` ... ドキュメント
- **開発コマンド例**:
  - `pnpm install` ... 依存関係インストール
  - `pnpm dev` ... 開発サーバ起動
  - `pnpm build` ... 本番ビルド

## Copilot 向け情報

- **API 仕様**: Django REST Framework で `/api/channels/`, `/api/videos/`, `/api/songs/` などのエンドポイントが提供されている前提で実装してください。
- **認証**: 現状、認証は不要（必要な場合は追記）
- **データ取得例**: `fetch('https://<APIサーバ>/api/videos/')` などで動画一覧が取得可能
- **型例**:
  ```ts
  type Channel = { id: number; name: string; url: string; ... };
  type Video = { id: string; channel: Channel; title: string; url: string; ... };
  type Song = { id: number; video: Video; title: string; artist: string; ... };
  ```
- **旧フロントエンドの移植**: `inuinouta-front` の UI/UX や機能を参考に、Nuxt3 流に最適化して移植してください。
- **API エラー処理やローディング UI も考慮**

---

このドキュメントは、Copilot や開発者が効率よく開発を進めるための指針です。追加情報や仕様変更があれば随時追記してください。
