# いぬいのうた Nuxt 4 版 ドキュメント目次

## 📚 概要

このディレクトリには、「いぬいのうた」Nuxt 4 リニューアルプロジェクトの技術ドキュメント、設計ガイド、実装計画が含まれています。

---

## 🚀 はじめに - Getting Started

初めて開発に参加する方は、以下の順序で読み進めることを推奨します。

- [getting-started/](getting-started/) - 初学者向けガイド集
  - [00-for-beginners.md](getting-started/00-for-beginners.md) - このプロジェクトで開発を始めるために必要な知識
  - [01-project-purpose.md](getting-started/01-project-purpose.md) - プロジェクトの目的、データ構造、技術スタック
  - [02-vue-basics.md](getting-started/02-vue-basics.md) - Vue.js の基礎
  - [03-nuxt-basics.md](getting-started/03-nuxt-basics.md) - Nuxt 4 の基礎
  - [04-tailwind-basics.md](getting-started/04-tailwind-basics.md) - Tailwind CSS の基礎
  - [05-dev-env.md](getting-started/05-dev-env.md) - 開発環境・ツール
  - [06-project-structure.md](getting-started/06-project-structure.md) - プロジェクト固有のディレクトリ構成

---

## 📖 開発ガイド - Guides

設計・実装を行う方向けのガイドドキュメント集です。

### アーキテクチャ・設計
- [guides/component-design.md](guides/component-design.md) - コンポーネント設計原則とベストプラクティス
- [guides/state-management.md](guides/state-management.md) - Pinia による状態管理のアーキテクチャ
- [guides/api-specification.md](guides/api-specification.md) - Django REST API の詳細仕様

### 機能設計
- [guides/playlist-design.md](guides/playlist-design.md) - プレイリスト機能設計（LocalStorage版）
- [guides/player-verification.md](guides/player-verification.md) - 再生制御システム検証レポート

### 実装計画・記録
- [guides/implementation-plan.md](guides/implementation-plan.md) - 旧システムの設計思想継承計画
- [guides/implementation-log.md](guides/implementation-log.md) - 実装・設計の意思決定ログ

### アナリティクス
- [guides/ga4-setup.md](guides/ga4-setup.md) - Google Analytics 4 セットアップガイド
- [guides/analytics-implementation.md](guides/analytics-implementation.md) - アナリティクス実装概要

---

## 🔄 移行関連 - Migration

Nuxt2 から Nuxt 4 への移行に関する情報です。

- [migration/](migration/) - 移行関連ドキュメント集
  - [guide.md](migration/guide.md) - Nuxt2→Nuxt 4 移行の実践ガイド
  - [notes.md](migration/notes.md) - 実装とAPI間の差異、将来実装予定の機能
  - [nuxt2-overview.md](migration/nuxt2-overview.md) - Nuxt2 版の機能一覧
  - [legacy-player-analysis.md](migration/legacy-player-analysis.md) - 旧システムの再生制御システム詳細解析

---

## 🤖 AI アシスタント - AI Prompts

AI 開発アシスタント向けのプロンプト集です。

- [ai-prompts/](ai-prompts/) - AI開発アシスタント用プロンプト
  - [chatgpt.md](ai-prompts/chatgpt.md) - ChatGPT 用プロンプト（全体計画、学習サポート）
  - [copilot.md](ai-prompts/copilot.md) - GitHub Copilot 用プロンプト（実装品質重視）

---

## 📝 作業記録 - Work Logs

日々の開発作業記録です（定期的にアーカイブ予定）。

- [work-logs/](work-logs/) - 日々の開発作業記録
  - [2025-06-25.md](work-logs/2025-06-25.md) - 2025年6月25日の作業記録

---

## 📖 ドキュメント活用ガイド

### 👶 初めて開発に参加する方

**推奨する読み順：**

1. [getting-started/00-for-beginners.md](getting-started/00-for-beginners.md) で必要な知識を確認
2. [getting-started/01-project-purpose.md](getting-started/01-project-purpose.md) でプロジェクト全体像を理解
3. [getting-started/02-vue-basics.md](getting-started/02-vue-basics.md) から順に基礎技術を学習
4. [getting-started/06-project-structure.md](getting-started/06-project-structure.md) でプロジェクト構成を把握

### 🔨 設計・実装を行う方

**推奨する読み順：**

1. [guides/component-design.md](guides/component-design.md) でコンポーネント設計原則を確認
2. [guides/state-management.md](guides/state-management.md) で状態管理の方針を理解
3. [guides/api-specification.md](guides/api-specification.md) で API 仕様を確認
4. [guides/implementation-plan.md](guides/implementation-plan.md) で実装計画を参照

### 🔄 旧システムからの移行作業を行う方

**推奨する読み順：**

1. [migration/guide.md](migration/guide.md) で移行方針を確認
2. [migration/nuxt2-overview.md](migration/nuxt2-overview.md) で旧システムの機能を把握
3. [migration/legacy-player-analysis.md](migration/legacy-player-analysis.md) で旧システムの詳細設計を理解
4. [migration/notes.md](migration/notes.md) で差異と注意点を確認

---

## 📂 ディレクトリ構造

```
docs/
├── index.md                    # このファイル（目次）
├── getting-started/            # 初学者向けガイド
├── guides/                     # 開発ガイド
├── migration/                  # 移行関連ドキュメント
├── ai-prompts/                # AI アシスタント用プロンプト
└── work-logs/                 # 日々の作業記録
```

---

## 📝 更新履歴

- 2025-12-28: ドキュメント構造を階層化し、目次を全面改訂
  - `getting-started/`, `guides/`, `migration/` ディレクトリを作成
  - ファイル命名規則をケバブケースに統一
  - 作業ログとAIプロンプトを専用ディレクトリに分離
- 2025-06-25: 日々の開発記録追加
- アナリティクス関連ドキュメント追加
- プレイリスト設計書追加
- 各種ガイド・設計書の継続的な更新

---

## 🔗 関連リソース

- **リポジトリ**: inuinouta-front-v3（本プロジェクト）
- **バックエンド**: inuinouta（Django REST Framework）
- **旧フロントエンド**: inuinouta-front（Nuxt2 版）
