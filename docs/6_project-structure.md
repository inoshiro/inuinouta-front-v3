# プロジェクト固有の構成ガイド

## ディレクトリの役割

### コア機能
- `app/components/`：Vue コンポーネント
  - `layout/`：ヘッダー・フッター・サイドバーなど共通 UI 部品
  - その他：再利用可能な機能コンポーネント
- `app/pages/`：各ページの実装（自動ルーティング）
- `app/layouts/`：ページレイアウト定義
  - `default.vue`：全ページ共通のレイアウト

### アーキテクチャ層
- `app/adapters/`：データ変換・アダプター層
- `app/stores/`：Pinia による状態管理
- `app/composables/`：再利用可能な Composition API ロジック
- `app/utils/`：汎用ユーティリティ関数

### 型定義・定数
- `app/types/`：TypeScript 型定義
- `app/constants/`：定数定義

### その他
- `app/assets/css/main.css`：Tailwind のエントリーポイント
- `app/plugins/`：Nuxt プラグイン
- `tailwind.config.js`：Tailwind の設定ファイル（プロジェクトルート）

## 主要ファイルの例

- `app/components/layout/Header.vue`：ヘッダー UI
- `app/components/layout/Footer.vue`：フッター UI
- `app/components/layout/Sidebar.vue`：サイドバー UI
- `app/layouts/default.vue`：全体レイアウト
- `app/pages/index.vue`：トップページ

## 参考リンク

- [Nuxt 4 ディレクトリ構成](https://nuxt.com/docs/guide/directory-structure/nuxt)
