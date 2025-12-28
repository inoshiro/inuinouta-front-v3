# いぬいのうた Nuxt 4 版 ドキュメント目次

## 📚 概要

このディレクトリには、「いぬいのうた」Nuxt 4 リニューアルプロジェクトの技術ドキュメント、設計ガイド、実装計画が含まれています。

---

## 🎯 プロジェクト基礎情報

### プロジェクト概要・目的
- [project-purpose.md](project-purpose.md) - プロジェクトの目的、データ構造、技術スタックの説明

### 初心者向けガイド
- [for-beginners.md](for-beginners.md) - このプロジェクトで開発を始めるために必要な知識のまとめ

---

## 🛠️ 開発環境・基礎技術ガイド

### 基礎技術
- [2_vue-basics.md](2_vue-basics.md) - Vue.js の基礎（データバインディング、イベントハンドリング、Props/Emit）
- [3_nuxt-basics.md](3_nuxt-basics.md) - Nuxt 4 の基礎（ディレクトリ構成、ルーティング、レイアウト）
- [4_tailwind-basics.md](4_tailwind-basics.md) - Tailwind CSS の基礎（ユーティリティクラス、カスタム設定）
- [5_dev-env.md](5_dev-env.md) - 開発環境・ツールガイド（パッケージマネージャ、開発サーバー、エディタ）

### プロジェクト構成
- [6_project-structure.md](6_project-structure.md) - プロジェクト固有のディレクトリ構成と役割

---

## 📐 アーキテクチャ・設計ガイド

### コンポーネント設計
- [component-design-guide.md](component-design-guide.md) - コンポーネント設計原則とベストプラクティス（SRP、Props設計、イベント設計など）

### 状態管理
- [state-management-guide.md](state-management-guide.md) - Pinia を使用した状態管理のアーキテクチャと設計原則

### API連携
- [api-specification.md](api-specification.md) - Django REST API の詳細仕様（エンドポイント、データ構造、レスポンス形式）

---

## 🔄 移行・リニューアル関連

### 移行ガイド
- [migration-guide.md](migration-guide.md) - Nuxt2→Nuxt 4 移行の実践ガイド（技術スタック刷新、設計変更）
- [migration-notes.md](migration-notes.md) - 実装と API 間の差異、将来実装予定の機能

### 旧システム分析
- [nuxt2-components-overview.md](nuxt2-components-overview.md) - Nuxt2 版の機能一覧とコンポーネント概要
- [legacy-player-system-analysis.md](legacy-player-system-analysis.md) - 旧プロジェクトの再生制御システムの詳細解析

---

## 📋 実装計画・記録

### 実装計画
- [implementation-plan.md](implementation-plan.md) - 旧プロジェクトの設計思想を継承するための具体的な実装計画

### 実装記録
- [implementation-log.md](implementation-log.md) - 実装・設計の意思決定ログと進捗記録
- [work-log-2025-06-25.md](work-log-2025-06-25.md) - 日々の開発作業記録とタスク管理

---

## 🎵 機能別設計書

### プレイリスト機能
- [playlist-localstorage-design.md](playlist-localstorage-design.md) - LocalStorage を使用したプレイリスト機能の設計書（暫定実装）

### 再生制御システム
- [player-verification.md](player-verification.md) - 再生制御システムの検証レポート（動作パターン、エッジケース）

---

## 📊 アナリティクス・計測

- [ga4-setup.md](ga4-setup.md) - Google Analytics 4 (GA4) のセットアップガイド
- [analytics-implementation.md](analytics-implementation.md) - アナリティクス実装概要（計測ポイント、イベント定義）

---

## 🤖 AI アシスタント向けプロンプト

- [ai-prompt-chatgpt.md](ai-prompt-chatgpt.md) - ChatGPT 用の開発サポートプロンプト（全体計画、学習、メンタルケア）
- [ai-prompt-copilot.md](ai-prompt-copilot.md) - GitHub Copilot 用の実装サポートプロンプト（型安全、保守性、品質重視）

---

## 📖 ドキュメント活用ガイド

### 初めて開発に参加する方
1. [for-beginners.md](for-beginners.md) で必要な知識を確認
2. [project-purpose.md](project-purpose.md) でプロジェクト全体像を理解
3. [2_vue-basics.md](2_vue-basics.md), [3_nuxt-basics.md](3_nuxt-basics.md), [4_tailwind-basics.md](4_tailwind-basics.md) で基礎技術を学習
4. [6_project-structure.md](6_project-structure.md) でプロジェクト構成を把握

### 設計・実装を行う方
1. [component-design-guide.md](component-design-guide.md) でコンポーネント設計原則を確認
2. [state-management-guide.md](state-management-guide.md) で状態管理の方針を理解
3. [api-specification.md](api-specification.md) で API 仕様を確認
4. [implementation-plan.md](implementation-plan.md) で実装計画を参照

### 旧システムからの移行作業を行う方
1. [migration-guide.md](migration-guide.md) で移行方針を確認
2. [nuxt2-components-overview.md](nuxt2-components-overview.md) で旧システムの機能を把握
3. [legacy-player-system-analysis.md](legacy-player-system-analysis.md) で旧システムの詳細設計を理解
4. [MIGRATION_NOTES.md](MIGRATION_NOTES.md) で差異と注意点を確認

---

## 📝 更新履歴

- 2025-12-28: ドキュメント目次（index.md）作成
- 2025-06-25: 日々の開発記録（todays_tasks.md）追加
- アナリティクス関連ドキュメント追加（GA4_SETUP.md, ANALYTICS_IMPLEMENTATION.md）
- プレイリスト設計書追加（playlist-localstorage-design.md）
- 各種ガイド・設計書の継続的な更新

---

## 🔗 関連リソース

- **リポジトリ**: inuinouta-front-v3（本プロジェクト）
- **バックエンド**: inuinouta（Django REST Framework）
- **旧フロントエンド**: inuinouta-front（Nuxt2 版）
