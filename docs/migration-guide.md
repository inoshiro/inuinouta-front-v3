# Nuxt2→Nuxt3 移行ガイド（inuinouta-front→inuinouta-front-v3）

## 目的

旧フロントエンド（Nuxt2/Bulma/Sass/Vuex）を、Nuxt3/TypeScript/Pinia/Tailwind CSS/Composition API などモダンな構成で再構築する際の実践ガイドです。

---

## 1. 技術スタック・設計の刷新

- Composition API（`<script setup>`、`ref`/`computed`/`watch`など）
- TypeScript による型安全な開発
- Pinia による状態管理（Vuex からの移行）
- Tailwind CSS でユーティリティファーストなスタイリング
- useFetch/useAsyncData で API 連携をシンプルに
- ファイルベースルーティング（`pages/`ディレクトリ）
- Composable（`composables/`）でロジックの再利用性向上

---

## 2. ディレクトリ構成例

```
components/      ... UI部品
composables/     ... API通信や共通ロジック
layouts/         ... 共通レイアウト
pages/           ... ルーティングページ
assets/          ... 静的アセット
public/          ... 静的ファイル
store/           ... Piniaストア（必要に応じて）
```

---

## 3. 旧実装からの主な移植ポイント

### API 通信

- Nuxt2: `@nuxtjs/axios` → Nuxt3: `useFetch`や`$fetch`、型定義を活用
- 例:
  ```ts
  // composables/useVideos.ts
  export const useVideos = () => useFetch<Video[]>("/api/videos/");
  ```

### 状態管理

- Nuxt2: Vuex → Nuxt3: Pinia
- 例:
  ```ts
  // store/usePlaylist.ts
  import { defineStore } from 'pinia'
  export const usePlaylist = defineStore('playlist', { ... })
  ```

### UI/スタイル

- Nuxt2: Bulma/Sass → Nuxt3: Tailwind CSS
- クラス設計をユーティリティベースに刷新

### コンポーネント設計

- `<script setup lang="ts">`でシンプルに
- props/emit の型定義
- slots の活用
- 再利用性を意識した粒度で分割

### ページ設計

- `pages/`配下にルーティングを自動生成
- 動画一覧・詳細・お気に入り・設定などをページ単位で整理

### API 型定義

- `types/`や`composables/`で API レスポンス型を定義し、全体で型安全に

### ローディング・エラー UI

- useAsyncData/useFetch の pending/error を活用し、UX 向上

---

## 4. Nuxt3 流のベストプラクティス

- SSR/CSR の切り替えや SEO も意識
- useHead でメタ情報を柔軟に設定
- middleware や plugins も必要に応じて活用
- テストや Linter/Formatter も導入

---

## 5. 旧コードからの移植手順例

1. 旧`components/`・`pages/`の UI/ロジックを Nuxt3 流に分割・移植
2. API 通信部分を`composables/`に集約し、型定義を付与
3. 状態管理を Pinia で再設計
4. Tailwind CSS でスタイルを再設計
5. ページ/ルーティング/レイアウトを整理
6. 動作確認・リファクタ・テスト

---

## 6. Nuxt サーバ API を活用したアーキテクチャの推奨

### サーバ API 経由で Django REST API と連携するメリット

- **認証・認可の柔軟な対応**
  - Nuxt サーバ API（`server/api/`）で API キーやトークン認証、リクエストヘッダの付与・検証などを一元的に実装できる。
  - 認証方式の追加・変更があっても、クライアント側の修正を最小限に抑えられる。
- **型定義の共有**
  - Nuxt サーバ API で Django API のレスポンス型を TypeScript で定義し、その型をクライアント側でも import して利用できる。
  - 型の重複やズレを防ぎ、型安全な開発が可能。
- **API 仕様の隠蔽・抽象化**
  - Django API のエンドポイントや仕様変更があっても、Nuxt サーバ API で吸収できる。
  - クライアントは「/api/videos」など Nuxt 側の API だけを意識すればよい。
- **追加ロジックの実装**
  - レスポンスの整形、キャッシュ、エラーハンドリング、ログ出力などをサーバ API で柔軟に実装できる。
- **セキュリティ向上**
  - API キーやシークレットをクライアントに露出せず、サーバ側で安全に管理できる。

### 実装例

- `server/api/videos.get.ts` で Django API から動画一覧を取得し、必要に応じて認証や整形を行って返却
- 型定義ファイル（例: `types/video.ts`）をサーバ・クライアント両方で import
- クライアント側は `/api/videos` など Nuxt サーバ API のみを呼び出す

### 注意点

- Nuxt サーバ API の実装・保守コストは増えるが、長期的な拡張性・保守性・セキュリティの観点で推奨される

---

## 6. Nuxt2 プラグイン実装からの改善ポイント

### 現状の課題

- Vuex ストアへの強い依存（状態・ロジックが密結合）
- inject/app.$xxx パターンによるグローバル参照の乱用
- DOM 操作を直接行うユーティリティ（ref や watchEffect で置き換え可能）
- API 通信がプラグインで即時実行される設計（useFetch/useAsyncData ＋ Composable で柔軟に）
- 型定義がなく、すべて JavaScript

### Nuxt3 での改善方針

- **Pinia ＋ Composable で状態・ロジックを分離・型安全に再設計**
- **inject/app.$xxx の乱用を避け、明示的な import/provide/inject や Composable、Pinia ストアで管理**
- **API 通信は useFetch/useAsyncData ＋型定義でページ/Composable 単位に**
- **DOM 操作は ref や watchEffect 等 Vue3 の機能でより自然に**
- **FontAwesome や YouTube 等の外部ライブラリは Nuxt3 用の公式/推奨プラグインを利用**
- **S3 画像パス生成等も Composable 化し、型付きで再利用性向上**
- **全体的に TypeScript 化し、型安全・保守性・テスト性を向上**

---

## まとめ

「UI/UX の再設計」「型安全」「ロジックの分離・再利用」「API 通信の最適化」「モダンな状態管理」「スタイリング刷新」を意識し、Nuxt3 の強みを最大限活かして再実装してください。

具体的な移植例やサンプルコードが必要な場合は、どの部分かご指定ください。
