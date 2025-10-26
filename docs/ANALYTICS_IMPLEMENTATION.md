# アナリティクス実装概要

Google Analytics 4 (GA4) を使用したユーザーアクティビティ計測の実装が完了しました。

## 📊 実装済みの計測ポイント

### 1. 楽曲再生 (`play_song`)

**追跡内容**: ユーザーがどの楽曲をどこから再生したか

**実装箇所**:

- ✅ `pages/songs/[id].vue` - 楽曲詳細ページの「今すぐ再生」ボタン
- ✅ `components/SongRow.vue` - 楽曲リストのサムネイル/タイトルクリック
- ✅ `pages/playlists/[id].vue` - プレイリスト内の楽曲クリック

**パラメータ**:

```typescript
{
  song_id: number,
  song_title: string,
  artist: string,
  is_original: boolean,
  has_video: boolean,
  is_stream: boolean
}
```

### 2. キューに追加 (`add_to_queue`)

**追跡内容**: ユーザーがどの楽曲をキューに追加したか

**実装箇所**:

- ✅ `pages/songs/[id].vue` - 楽曲詳細ページの「キューに追加」ボタン
- ✅ `components/SongRow.vue` - コンテキストメニューの「キューに追加」
- ✅ `pages/playlists/[id].vue` - プレイリスト内のキュー追加

**パラメータ**:

```typescript
{
  song_id: number,
  song_title: string,
  artist: string
}
```

### 3. 検索 (`search`)

**追跡内容**: ユーザーがどのキーワードで検索したか、結果数

**実装箇所**:

- ✅ `pages/songs/index.vue` - 楽曲検索（1 秒デバウンス付き）
- ✅ `pages/streams/index.vue` - 歌枠検索（1 秒デバウンス付き）

**パラメータ**:

```typescript
{
  search_term: string,
  result_count: number
}
```

**特徴**: デバウンス処理により、ユーザーが入力を続けている間は送信されず、1 秒間入力が止まった時点で送信されます。

### 4. フィルター適用 (`filter_apply`)

**追跡内容**: ユーザーがどのフィルターを使用したか

**実装箇所**:

- ✅ `pages/songs/index.vue` - アーティスト、楽曲タイプ、動画タイプフィルター

**パラメータ**:

```typescript
{
  filter_type: 'artist' | 'song_type' | 'video_type',
  filter_value: string
}
```

### 5. ソート変更 (`sort_change`)

**追跡内容**: ユーザーがどのソート条件を選択したか

**実装箇所**:

- ✅ `pages/songs/index.vue` - 楽曲一覧のソート変更
- ✅ `pages/streams/index.vue` - 歌枠一覧のソート変更

**パラメータ**:

```typescript
{
  sort_by: 'songs' | 'streams',
  order: string // 例: '-video.published_at,start_at'
}
```

### 6. プレイリスト操作 (`playlist_action`)

**追跡内容**: プレイリストの作成、編集、削除、再生

**実装箇所**:

- ✅ `components/PlaylistCreateModal.vue` - プレイリスト作成
- ✅ `components/PlaylistEditModal.vue` - プレイリスト編集
- ✅ `pages/playlists/[id].vue` - プレイリスト削除、全曲再生
- ✅ `components/SongRow.vue` - プレイリストに楽曲追加
- ✅ `pages/streams/index.vue` - 歌枠全体をキューに追加、ランダム再生

**パラメータ**:

```typescript
{
  action: 'create' | 'edit' | 'delete' | 'play' | 'add_song',
  playlist_id?: string,
  song_id?: number
}
```

### 7. YouTube リンククリック (`youtube_click`)

**追跡内容**: ユーザーが YouTube リンクをクリックした

**実装箇所**:

- ✅ `pages/songs/[id].vue` - 楽曲詳細ページの「YouTube で開く」ボタン
- ✅ `components/SongRow.vue` - コンテキストメニューの「YouTube で開く」

**パラメータ**:

```typescript
{
  song_id: number,
  video_id: string
}
```

### 8. パーマリンクコピー (`permalink_copy`)

**追跡内容**: ユーザーが楽曲のパーマリンクをコピーした

**実装箇所**:

- ✅ `pages/songs/[id].vue` - 楽曲詳細ページの「コピー」ボタン

**パラメータ**:

```typescript
{
  song_id: number;
}
```

### 9. ページビュー (`page_view`)

**追跡内容**: ページ遷移（自動）

**実装箇所**:

- ✅ `plugins/gtag.client.ts` - ルート変更時に自動送信

**パラメータ**:

```typescript
{
  page_path: string,
  page_title: string,
  page_location: string
}
```

## 🛠️ 技術仕様

### アーキテクチャ

```
plugins/gtag.client.ts
├── Google Analytics スクリプト読み込み
├── gtag 関数の初期化
└── ページビューの自動トラッキング

composables/useAnalytics.ts
├── カスタムイベント送信のラッパー
├── 各種トラッキングメソッド
└── 開発環境対応（コンソール出力）

各ページ・コンポーネント
├── useAnalytics() の呼び出し
└── 適切なタイミングでイベント送信
```

### デバウンス処理

検索イベントには 1 秒のデバウンスが実装されています：

```typescript
let searchDebounceTimer: NodeJS.Timeout | null = null;
watch(searchQuery, (newQuery) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  if (newQuery.trim()) {
    searchDebounceTimer = setTimeout(() => {
      analytics.trackSearch(newQuery, filteredResults.value.length);
    }, 1000);
  }
});
```

これにより、ユーザーが入力中に過度なイベント送信を防ぎます。

## 📈 分析可能なインサイト

実装された計測により、以下のような分析が可能になります：

### ユーザー行動分析

- 最も再生される楽曲・アーティスト
- プレイリスト作成・編集の頻度
- 検索キーワードの傾向

### コンテンツ人気度

- オリジナル曲 vs カバー曲の人気
- 歌動画 vs 配信アーカイブの人気
- アーティスト別の再生数

### 機能利用状況

- キュー機能の使用頻度
- プレイリスト機能の利用状況
- フィルター・ソート機能の利用パターン

### ユーザーフロー

- 楽曲詳細ページへの遷移元
- プレイリストからの再生率
- YouTube への外部遷移率

## 🎯 今後の拡張可能性

### 追加で計測できる項目

1. **再生時間の計測**

   - 楽曲をどれだけの時間聴いたか
   - スキップ率の計測

2. **エラートラッキング**

   - 再生エラーの発生状況
   - API エラーの記録

3. **パフォーマンス計測**

   - ページ読み込み時間
   - API レスポンス時間

4. **カスタムディメンション**
   - ユーザーセグメント（新規/リピーター）
   - デバイスタイプ別分析

## 📝 メンテナンス

### イベント追加方法

新しいイベントを追加する場合：

1. `composables/useAnalytics.ts` に新しいメソッドを追加
2. 該当するページ・コンポーネントで `useAnalytics()` を呼び出し
3. 適切なタイミングでメソッドを実行
4. このドキュメントを更新

### デバッグ方法

開発環境では、イベントはコンソールに出力されます：

```
Analytics Event: play_song {song_id: 123, song_title: "...", ...}
```

本番環境では、Google Analytics のリアルタイムレポートで確認できます。

## 🔒 プライバシーへの配慮

- 個人を特定できる情報（PII）は送信していません
- 楽曲 ID、タイトル、アーティスト名など公開情報のみ
- Cookie 同意バナーの実装を推奨（今後の課題）

## 📚 関連ドキュメント

- [GA4_SETUP.md](./GA4_SETUP.md) - セットアップ手順
- [Google Analytics 4 公式ドキュメント](https://support.google.com/analytics/answer/9304153)
