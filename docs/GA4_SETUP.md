# Google Analytics 4 (GA4) セットアップガイド

このプロジェクトには Google Analytics 4 (GA4)が統合されており、ユーザーのアクティビティを計測できます。

## セットアップ手順

### 1. Google Analytics 4 アカウントの作成

1. [Google Analytics](https://analytics.google.com/)にアクセス
2. 「測定を開始」をクリック
3. アカウントを作成
4. プロパティを作成（プラットフォーム: ウェブ）
5. **測定 ID（G-XXXXXXXXXX 形式）**を取得

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、取得した測定 ID を設定します。

```bash
# .env ファイルを作成
cp .env.example .env
```

`.env` ファイルを編集：

```bash
# Google Analytics 4 測定ID
NUXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # ←ここに取得した測定IDを入力
```

### 3. 本番環境（Vercel）での設定

Vercel にデプロイしている場合：

1. Vercel のプロジェクトダッシュボードにアクセス
2. Settings → Environment Variables
3. 以下の環境変数を追加：
   - Key: `NUXT_PUBLIC_GA_ID`
   - Value: `G-XXXXXXXXXX`（取得した測定 ID）
   - Environment: Production, Preview, Development (必要に応じて)

### 4. 動作確認

開発サーバーを起動：

```bash
pnpm dev
```

ブラウザの開発者ツール（Console）で以下を確認：

- GA4 スクリプトが読み込まれている
- イベントが送信されている（`Analytics Event:` のログ）

Google Analytics の**リアルタイムレポート**でもデータが表示されることを確認できます。

## 計測されるイベント

### 自動計測

- **ページビュー**: ページ遷移時に自動送信

### カスタムイベント

以下のユーザーアクションを計測しています：

#### 楽曲関連

- `play_song`: 楽曲を再生

  - `song_id`, `song_title`, `artist`, `is_original`, `has_video`, `is_stream`
  - **実装箇所**:
    - `pages/songs/[id].vue` - 楽曲詳細ページでの再生
    - `components/SongRow.vue` - 楽曲リスト内での再生
    - `pages/playlists/[id].vue` - プレイリストからの再生

- `add_to_queue`: 楽曲をキューに追加
  - `song_id`, `song_title`, `artist`
  - **実装箇所**:
    - `pages/songs/[id].vue` - 楽曲詳細ページ
    - `components/SongRow.vue` - 楽曲リスト
    - `pages/playlists/[id].vue` - プレイリスト詳細

#### リンク・コピー

- `youtube_click`: YouTube リンクをクリック

  - `song_id`, `video_id`
  - **実装箇所**:
    - `pages/songs/[id].vue` - 楽曲詳細ページ
    - `components/SongRow.vue` - 楽曲リストのコンテキストメニュー

- `permalink_copy`: パーマリンクをコピー
  - `song_id`
  - **実装箇所**:
    - `pages/songs/[id].vue` - 楽曲詳細ページ

#### 検索・フィルター

- `search`: 検索を実行

  - `search_term`, `result_count`
  - **実装箇所**:
    - `pages/songs/index.vue` - 楽曲一覧ページ（デバウンス付き）
    - `pages/streams/index.vue` - 歌枠一覧ページ（デバウンス付き）

- `sort_change`: ソート条件を変更

  - `sort_by`, `order`
  - **実装箇所**:
    - `pages/songs/index.vue` - 楽曲一覧ページ
    - `pages/streams/index.vue` - 歌枠一覧ページ

- `filter_apply`: フィルターを適用
  - `filter_type`, `filter_value`
  - **実装箇所**:
    - `pages/songs/index.vue` - アーティスト、楽曲タイプ、動画タイプフィルター

#### プレイリスト

- `playlist_action`: プレイリスト操作
  - `action` (`create`, `edit`, `delete`, `play`, `add_song`)
  - `playlist_id`, `song_id`
  - **実装箇所**:
    - `components/PlaylistCreateModal.vue` - プレイリスト作成
    - `components/PlaylistEditModal.vue` - プレイリスト編集
    - `pages/playlists/[id].vue` - プレイリスト削除、全曲再生、楽曲再生
    - `components/SongRow.vue` - プレイリストに楽曲追加
    - `pages/streams/index.vue` - 歌枠全体をキューに追加、ランダム歌枠再生

## 使い方

### ページにイベントトラッキングを追加する

```vue
<script setup>
  const analytics = useAnalytics();

  // 楽曲再生をトラッキング
  const handlePlay = (song) => {
    analytics.trackSongPlay(song);
    // ... 実際の再生処理
  };

  // 検索をトラッキング
  const handleSearch = (query, results) => {
    analytics.trackSearch(query, results.length);
    // ... 検索処理
  };
</script>
```

### 利用可能なメソッド

`useAnalytics()` composable で以下のメソッドが使えます：

- `trackPageView(pagePath, pageTitle?)` - ページビュー
- `trackSongPlay(song)` - 楽曲再生
- `trackAddToQueue(song)` - キューに追加
- `trackSearch(query, resultCount?)` - 検索
- `trackPlaylistAction(action, playlistId?, songId?)` - プレイリスト操作
- `trackYouTubeClick(songId, videoId)` - YouTube リンククリック
- `trackPermalinkCopy(songId)` - パーマリンクコピー
- `trackSortChange(sortBy, order)` - ソート変更
- `trackFilterApply(filterType, filterValue)` - フィルター適用

## トラブルシューティング

### イベントが送信されない

1. 環境変数 `NUXT_PUBLIC_GA_ID` が正しく設定されているか確認
2. ブラウザの開発者ツールでコンソールエラーを確認
3. 広告ブロッカーが有効になっていないか確認

### リアルタイムレポートにデータが表示されない

- データの反映には数分かかる場合があります
- 測定 ID が正しいか確認
- ブラウザのプライベートモードで試してみる

### 開発環境で GA4 を無効にしたい

環境変数を設定しない、または空文字列にすると、イベントはコンソールにのみ出力されます。

```bash
# .env
NUXT_PUBLIC_GA_ID=  # 空にする
```

## プライバシーへの配慮

- 個人を特定できる情報（PII）は送信しないようにしてください
- 必要に応じてプライバシーポリシーを更新してください
- Cookie 同意バナーの実装を検討してください

## 参考リンク

- [Google Analytics 4 公式ドキュメント](https://support.google.com/analytics/answer/9304153)
- [gtag.js リファレンス](https://developers.google.com/analytics/devguides/collection/gtagjs)
- [Nuxt 3 ドキュメント](https://nuxt.com/docs)
