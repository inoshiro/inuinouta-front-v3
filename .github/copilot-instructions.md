# いぬいのうた Nuxt 4 リニューアルプロジェクト - Copilot Instructions

## プロジェクト概要

「いぬいのうた」は、バーチャルライバー戌亥とこの歌動画・楽曲を快適に視聴・管理できるWebサービスです。本プロジェクトは、Nuxt2からNuxt 4への完全リニューアルを行っています。

- **技術スタック**: Nuxt 4 + Vue 3 + TypeScript + Pinia + Tailwind CSS + Vite
- **バックエンド**: Django REST Framework（別リポジトリ `inuinouta`）
- **パッケージマネージャ**: pnpm
- **開発環境**: VSCode on Linux

---

## ビルド・テスト・実行手順

### 環境構築

```bash
# 依存関係のインストール（必ず最初に実行）
pnpm install

# 開発サーバー起動（ポート3000）
pnpm dev

# 本番ビルド
pnpm build

# ビルドのプレビュー
pnpm preview
```

### 環境変数

プロジェクトルートに `.env` ファイルを作成：

```env
DJANGO_API_URL=http://127.0.0.1:8000/api
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 検証手順

1. ESLint チェック: `npx eslint .`
2. TypeScript 型チェック: `npx nuxi typecheck`
3. 開発サーバー起動後、http://localhost:3000 で動作確認
4. ビルド前に必ず型エラーがないことを確認

---

## プロジェクト構造

```
app/
├── components/          # Vueコンポーネント
│   ├── layout/         # ヘッダー・フッター等の共通UI（グローバル登録）
│   └── ...             # 機能別コンポーネント
├── pages/              # ページコンポーネント（ファイルベースルーティング）
├── layouts/            # レイアウト定義
│   └── default.vue     # 全ページ共通レイアウト
├── composables/        # 再利用可能なComposition APIロジック
├── stores/             # Pinia状態管理
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
├── constants/          # 定数定義
├── adapters/           # データ変換・アダプター層
├── services/           # 外部サービス連携
├── plugins/            # Nuxtプラグイン
└── assets/css/         # グローバルCSS

server/
└── api/                # APIプロキシエンドポイント

docs/
├── getting-started/    # 初学者向けガイド
├── guides/             # 開発ガイド
├── migration/          # 移行関連ドキュメント
└── ai-prompts/         # AI開発サポート用プロンプト

設定ファイル:
- nuxt.config.ts        # Nuxt設定
- tailwind.config.js    # Tailwind CSS設定
- eslint.config.mjs     # ESLint設定
- tsconfig.json         # TypeScript設定
- package.json          # 依存関係・スクリプト
```

### 重要なファイルの役割

- **`server/api/`**: Django REST APIへのプロキシ層（セキュリティ・型安全性向上）
- **`utils/api.ts`**: Django API通信用の共通ユーティリティ
- **`composables/`**: API通信、状態管理、ビジネスロジックの再利用可能な関数
- **`components/layout/`**: `Layout`プレフィックスでグローバル登録される共通UIコンポーネント

---

## コーディング規約・ベストプラクティス

### TypeScript

- **厳格な型付け**: `strict: true` モードを使用
- すべての関数に明示的な型注釈を付ける
- `any` 型は原則禁止（やむを得ない場合は `unknown` を使用）
- API レスポンスは必ず型定義を作成（`app/types/` に配置）

### Vue 3 / Nuxt 4

- **Composition API + `<script setup>`** を必ず使用（Options API は使用禁止）
- **単一責任の原則**: 1コンポーネント = 1つの責務
- Props は `defineProps<T>()` で型定義
- Emits は `defineEmits<T>()` で型定義
- `inject/provide` やグローバル状態の乱用を避ける
- 直接的なDOM操作は禁止（Vue のリアクティブシステムを使用）

**良いコンポーネント例**:

```vue
<script setup lang="ts">
interface Props {
  title: string;
  count: number;
}

interface Emits {
  (e: 'update', value: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleClick = () => {
  emit('update', props.count + 1);
};
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <button @click="handleClick">Count: {{ count }}</button>
  </div>
</template>
```

### Pinia 状態管理

- グローバル状態は最小限に（コンポーネントローカルで完結できるものは状態管理しない）
- ストアは機能単位で分割（`usePlayerStore`, `useQueueStore` など）
- ストア内のアクションで副作用を集約
- Composables とストアの使い分け:
  - **Composables**: API通信、再利用可能なロジック
  - **Stores**: アプリケーション横断的な状態管理

### API連携

- **必ず `server/api/` を経由**: クライアントから直接Django APIを呼ばない
- エラーハンドリングは一貫性を保つ（try-catch + エラーメッセージ表示）
- ローディング状態の管理を適切に行う
- `composables/` 内でAPI通信ロジックをラップ

**API プロキシパターン**:

```typescript
// server/api/songs/index.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  
  const response = await fetch(
    `${config.djangoApiUrl}/songs/?${new URLSearchParams(query)}`
  );
  
  return response.json();
});
```

**Composable パターン**:

```typescript
// composables/useSongs.ts
export const useSongs = () => {
  const songs = ref<Song[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchSongs = async (params?: SongSearchParams) => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await $fetch('/api/songs', { query: params });
      songs.value = data.results;
    } catch (e) {
      error.value = 'データの取得に失敗しました';
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  return { songs, loading, error, fetchSongs };
};
```

### Tailwind CSS

- ユーティリティファーストで記述
- カスタムCSSは最小限（`@apply` の乱用を避ける）
- レスポンシブデザインは `sm:`, `md:`, `lg:` プレフィックスを使用
- 再利用可能なスタイルはコンポーネントに集約

### ファイル・ネーミング規約

- **コンポーネント**: PascalCase（例: `SongRow.vue`, `VideoPlayer.vue`）
- **Composables**: `use` プレフィックス（例: `useSongs.ts`, `usePlayer.ts`）
- **Stores**: `use` + `Store` サフィックス（例: `usePlayerStore.ts`）
- **Types**: 型名は PascalCase（例: `Song`, `Video`, `Playlist`）
- **Utils**: camelCase（例: `formatTime.ts`, `validateUrl.ts`）

---

## 主要なデータ型

Django REST API から取得する主なデータ構造:

```typescript
// app/types/api.ts
interface Video {
  id: string;
  title: string;
  url: string; // YouTube URL
  thumbnail_path: string;
  is_open: boolean;
  is_member_only: boolean;
  is_stream: boolean;
  unplayable: boolean;
  published_at: string;
  songs: Song[];
}

interface Song {
  id: string;
  video: Video; // ネストされた動画情報
  title: string;
  artist: string;
  is_original: boolean;
  start_at: number; // 秒単位
  end_at: number; // 秒単位
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  created_at: string;
  items: PlaylistItem[];
}

interface PlaylistItem {
  id: string;
  song: Song;
  order: number;
}
```

**重要**: 各楽曲（Song）は常にネストされた動画（Video）情報を含みます。

---

## 移行に関する注意事項

### 避けるべきパターン（Nuxt2の古い書き方）

- ❌ Options API (`data()`, `methods`, `computed`)
- ❌ `inject`/`app.$xxx` パターン
- ❌ Vuex（代わりに Pinia を使用）
- ❌ `@nuxtjs/axios`（代わりに `$fetch` または `useFetch` を使用）
- ❌ グローバル副作用や直接的なDOM操作
- ❌ Bulma CSS（代わりに Tailwind CSS を使用）

### 推奨パターン（Nuxt 4の新しい書き方）

- ✅ Composition API + `<script setup>`
- ✅ Composables による再利用可能なロジック
- ✅ Pinia による状態管理
- ✅ `$fetch`, `useFetch`, `useAsyncData` によるAPI通信
- ✅ TypeScript strict モード
- ✅ Tailwind CSS によるユーティリティファーストなスタイリング

---

## 開発時の重要な注意点

### 必ず実行すべきこと

1. **型エラーのゼロ化**: コミット前に必ず `npx nuxi typecheck` を実行
2. **ESLint チェック**: コードの品質を保つため、警告・エラーを解消
3. **エラーハンドリング**: すべての非同期処理に try-catch を実装
4. **ローディング状態**: データ取得中は適切にローディング表示
5. **アクセシビリティ**: セマンティックHTML、適切な aria 属性、キーボード操作対応

### パフォーマンス最適化

- 大きなリストは仮想スクロールを検討
- 画像は遅延読み込み（lazy loading）を実装
- 不要な再レンダリングを避ける（`computed`, `watch` の適切な使用）
- API リクエストのキャッシュ戦略を検討

### セキュリティ

- ユーザー入力は必ずバリデーション・サニタイズ
- XSS 対策: Vue のテンプレート機能を活用（`v-html` は最小限に）
- CSRF 対策: Django 側で対応（将来的に認証実装時）
- 環境変数に秘密情報を含めない（`.env` は `.gitignore` に追加済み）

---

## ドキュメント参照

詳細な設計指針やガイドラインは以下のドキュメントを参照してください:

- **初学者向け**: `docs/getting-started/` - プロジェクトの基礎知識
- **設計ガイド**: `docs/guides/component-design.md` - コンポーネント設計原則
- **状態管理**: `docs/guides/state-management.md` - Pinia アーキテクチャ
- **API仕様**: `docs/guides/api-specification.md` - Django REST API 詳細
- **移行ガイド**: `docs/migration/guide.md` - Nuxt2→Nuxt4 移行のベストプラクティス

---

## コミット前チェックリスト

実装完了時、以下を確認してください:

- [ ] TypeScript の型エラーがゼロ（`npx nuxi typecheck`）
- [ ] ESLint の警告・エラーがゼロ（`npx eslint .`）
- [ ] すべての非同期処理にエラーハンドリングを実装
- [ ] Props と Emits に適切な型定義
- [ ] コンポーネントは単一責任を守っている
- [ ] Tailwind CSS でレスポンシブ対応
- [ ] 不要な `console.log` を削除
- [ ] ローディング状態とエラー状態の表示を実装

---

## 追加の実装ガイドライン

### 新規コンポーネント作成時

1. `app/components/` 内に適切なサブディレクトリを作成
2. PascalCase のファイル名を使用
3. `<script setup lang="ts">` で開始
4. Props と Emits の型を明示的に定義
5. 単一責任の原則を遵守
6. 必要に応じて Composables を活用

### 新規 Composable 作成時

1. `app/composables/` に配置
2. `use` プレフィックスを付与
3. 戻り値の型を明示
4. 副作用は適切に管理（`onMounted`, `watchEffect` など）
5. 再利用性を意識した設計

### 新規 API エンドポイント追加時

1. `server/api/` にプロキシエンドポイントを作成
2. Django API との通信ロジックを実装
3. 環境変数 `runtimeConfig.djangoApiUrl` を使用
4. エラーハンドリングを実装
5. 対応する Composable を作成してラップ

---

このインストラクションに従って、型安全で保守性の高い、モダンなNuxt 4アプリケーションを構築してください。
