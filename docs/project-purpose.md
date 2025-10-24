# プロジェクト目的と開発ガイド

## プロジェクト概要

本プロジェクトは、バーチャルライバー戌亥とこの歌動画を快適に視聴・管理できる Web サービス「いぬいのうた」のフロントエンドを、最新の Nuxt3（TypeScript, Vite, Composition API, Tailwind CSS 等）で再構築するものです。

- **バックエンド**: Django + Django REST Framework（`inuinouta` リポジトリ）
- **旧フロントエンド**: Nuxt2（`inuinouta-front` リポジトリ）
- **新フロントエンド**: Nuxt3（本プロジェクト, `inuinouta-front-v3` リポジトリ）

## 主要なデータ構造

Django REST API から取得する主なデータ:

- **Video**: 動画情報（id, title, url, thumbnail_path, is_open, is_member_only, is_stream, unplayable, published_at, songs, ...）
- **Song**: 楽曲情報（id, video, title, artist, is_original, start_at, end_at, ...）
- **Playlist**: プレイリスト情報（id, name, description, created_at, items, ...）

**注意**: 各楽曲（Song）は常にネストされた動画（Video）情報を含みます。

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

- **API 仕様**: Django REST Framework + Dynamic REST で `/api/videos/`, `/api/songs/`, `/api/random/` などのエンドポイントが提供されている前提で実装してください。
- **認証**: 現状、認証は不要（必要な場合は追記）
- **データ取得例**: `fetch('http://127.0.0.1:8000/api/videos/')` などで動画一覧が取得可能
- **型例**:
  ```ts
  type Video = {
    id: string;
    title: string;
    url: string;
    thumbnail_path: string;
    is_open: boolean;
    is_member_only: boolean;
    is_stream: boolean;
    unplayable: boolean;
    published_at: string;
    songs_count?: number; // リストエンドポイントのみ
    songs?: Song[]; // 詳細エンドポイントのみ
  };
  type Song = {
    id: number;
    video: Video; // 常にネストされたVideoオブジェクト
    title: string;
    artist: string;
    is_original: boolean;
    start_at: number | null;
    end_at: number | null;
  };
  ```
- **旧フロントエンドの移植**: `inuinouta-front` の UI/UX や機能を参考に、Nuxt3 流に最適化して移植してください。
- **API エラー処理やローディング UI も考慮**

---

このドキュメントは、Copilot や開発者が効率よく開発を進めるための指針です。追加情報や仕様変更があれば随時追記してください。
