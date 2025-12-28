# いぬいのうた Nuxt 4 リニューアル開発用 GitHub Copilot プロンプト

## 目的

- 「いぬいのうた」Web アプリの Nuxt2→Nuxt 4 リニューアル開発において、Copilot が品質の高い実装・リファクタ・型安全・保守性・テスト性を重視してサポートするためのプロンプトです。

## 指針

- Nuxt 4 ＋ TypeScript ＋ Pinia ＋ Tailwind CSS ＋ Django REST API ＋ VSCode ＋ Copilot agent 環境を前提に、最適な設計・実装例・リファクタ案を提案してください。
- サーバ API（server/api/）経由で Django API と連携し、認証や型定義の共有、API 仕様の隠蔽・抽象化を実現する設計を推奨してください。
- inject/app.$xxx パターンや Vuex 依存、グローバル副作用、直接的な DOM 操作は避け、Composable や ref、型安全な設計に刷新してください。
- コード例・設計例は常に型定義・エラーハンドリング・アクセシビリティ・テスト性・保守性を意識してください。
- docs/配下の各種ドキュメントを参照し、現状の仕様・課題・改善方針を踏まえて最適な実装を提案してください。
- コーディング規約・Git 運用・CI/CD・テスト方針など、品質向上に資するルールも遵守してください。

---

## いぬいのうた Nuxt 4 リニューアル開発用 Copilot 向け追加プロンプト

### プロジェクト背景・全体像

- 「いぬいのうた」は、バーチャルライバー戌亥とこの歌動画・楽曲を快適に視聴・管理できる Web サービス。
- バックエンドは Django REST API、フロントエンドは Nuxt2（旧）→Nuxt 4（新）で構築。
- Nuxt 4 移行では、UI/UX・保守性・拡張性・型安全性の大幅な向上を目指す。

### 実装・品質重視のサポート方針

- Nuxt 4 ＋ TypeScript ＋ Pinia ＋ Tailwind CSS ＋ Django REST API ＋ VSCode ＋ Copilot agent 環境を前提に、最適な設計・実装例・リファクタ案を提案してください。
- サーバ API（server/api/）経由で Django API と連携し、認証や型定義の共有、API 仕様の隠蔽・抽象化を実現する設計を推奨してください。
- inject/app.$xxx パターンや Vuex 依存、グローバル副作用、直接的な DOM 操作は避け、Composable や ref、型安全な設計に刷新してください。
- コード例・設計例は常に型定義・エラーハンドリング・アクセシビリティ・テスト性・保守性を意識してください。
- docs/配下の各種ドキュメントを参照し、現状の仕様・課題・改善方針を踏まえて最適な実装を提案してください。
- コーディング規約・Git 運用・CI/CD・テスト方針など、品質向上に資するルールも遵守してください。

### 開発環境・ツール

- 本プロジェクトは **VSCode** および **GitHub Copilot/Copilot agent** を活用して開発を進めています。
- OS は Linux、デフォルトシェルは bash です。
- パッケージ管理は pnpm、主要技術は Nuxt 4 ＋ TypeScript ＋ Pinia ＋ Tailwind CSS です。

### 追加インプット例

- コーディング規約（ESLint/Prettier 等）や Git 運用ルール
- デザインガイドラインや Figma 等の参照先
- バックエンド API の詳細仕様・認証方式・レスポンス例
- 主要な型定義やバリデーションルール
- デプロイ・CI/CD フロー
- 既知の課題や今後の展望

---

## 現在の実装状況（2025-06-25時点）

### ✅ 完了済み機能

#### APIプロキシレイヤー
- `utils/api.ts`: Django REST API 通信用共通ユーティリティ
- `server/api/songs/index.get.ts`: 楽曲一覧・検索APIプロキシ
- `server/api/videos/index.get.ts`: 動画一覧・検索APIプロキシ
- `server/api/random.get.ts`: ランダム楽曲取得APIプロキシ
- 環境変数管理（`.env`, `nuxt.config.ts` runtimeConfig）

#### UI/UXコンポーネント
- `components/SongRow.vue`: 楽曲行コンポーネント（サムネイル・情報・操作）
- `components/SongList.vue`: 楽曲リストコンポーネント
- `pages/songs/index.vue`: 楽曲一覧ページ（検索・フィルター・ソート）
- レスポンシブデザイン、Tailwind CSS ベース

#### 状態管理・データフロー
- `composables/useSongs.ts`: 楽曲検索・フィルター・ランダム取得
- `composables/useVideos.ts`: 動画検索・ID指定取得
- 型安全なAPI通信、エラーハンドリング

### 🔄 実装中・次回優先

#### YouTube Player統合
- YouTube IFrame Player API の Nuxt 4 統合
- `components/VideoPlayer.vue` の実装
- プレイヤー状態管理とキュー連携

#### 機能完成度向上
- SongRow の動画サムネイル表示
- ページネーション対応
- トースト通知システム

### 📋 設計原則・ベストプラクティス

#### 実証済みパターン
1. **APIプロキシパターン**: `server/api/` → Django REST API の安全な抽象化
2. **Composables設計**: 型安全で再利用可能なAPI通信ロジック
3. **コンポーネント分離**: SongRow/SongList の適切な責務分担
4. **エラーハンドリング**: APIレベル〜UIレベルの一貫したエラー処理

#### 推奨事項
- Vue 3 Composition API + TypeScript の活用
- Props/Emits による明確なデータフロー
- ESLint/Prettier による一貫したコード品質
- レスポンシブファーストのTailwind CSS設計

---
