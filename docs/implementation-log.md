# Nuxt3 版「いぬいのうた」実装・設計ドキュメント

## 1. プロジェクト概要

- バーチャルライバー戌亥とこの歌動画を快適に視聴・管理できる Web サービスの Nuxt3 リニューアル版。
- バックエンド: Django REST Framework
- フロントエンド: Nuxt3 (TypeScript, Pinia, Tailwind CSS, Composition API)

## 2. 実装方針・意思決定ログ

### 2.1 データ・状態管理

- **プレイリスト**: Django REST API で永続管理。ユーザーごとに作成・編集・削除可能。
- **再生キュー**: Pinia ストアでフロント側一時管理。ページ遷移やセッション中は保持、永続保存はしない。
- **型定義**: API レスポンス・内部データは TypeScript 型で厳密に管理。
- **UI/UX**: Tailwind CSS でモダンな UI、Composition API でロジック分離。

### 2.2 主な意思決定

- Nuxt3 のベストプラクティス（Pinia, Composables, 型定義, ファイルベースルーティング）を優先。
- プレイリスト（永続）と再生キュー（一時）を明確に分離し、柔軟な再生体験を実現。
- API 通信は composables/でラップし、型安全に。
- UI は「プレイリスト一覧 → 詳細 → 再生キュー操作」の流れを重視。
- SSR/CSR 両対応、エラー・ローディング UI も考慮。

## 3. 実装済み内容

### 3.1 型定義

- `types/song.ts`, `types/video.ts`, `types/channel.ts`, `types/playlist.ts` を作成。
- `QueueItem`型で再生キューのメタ情報も保持。

### 3.2 Composables

- `useSongs.ts`, `useVideos.ts`, `usePlaylist.ts` で API 取得用 Composable を実装。
- **[新規実装]** `useSongs.ts` を拡張し、検索・フィルター・ランダム楽曲取得機能を追加。
- **[新規実装]** `useVideos.ts` を拡張し、動画検索・ID 指定取得機能を追加。

### 3.3 API プロキシレイヤー

- **[新規実装]** `utils/api.ts`: Django REST API との通信用共通ユーティリティ
- **[新規実装]** `server/api/songs/index.get.ts`: 楽曲一覧・検索 API プロキシ
- **[新規実装]** `server/api/videos/index.get.ts`: 動画一覧・検索 API プロキシ
- **[新規実装]** `server/api/random.get.ts`: ランダム楽曲取得 API プロキシ
- **[設定追加]** `nuxt.config.ts`: runtimeConfig で Django API URL を環境変数化

### 3.4 Pinia ストア

- `stores/player.ts`: 現在再生中の曲・状態を管理。
- `stores/usePlayerQueue.ts`: 再生キュー（QueueItem[]）と再生インデックスを管理。

### 3.5 UI コンポーネント

- `pages/playlists.vue`: プレイリスト一覧表示。詳細ページへの遷移ボタンあり。
- `pages/playlists/[id].vue`: プレイリスト詳細・曲リスト・「再生」「キューに追加」ボタン。
- `components/PlayerQueuePanel.vue`: 再生キューの中身・再生・スキップ・クリア操作 UI。
- `layouts/default.vue`: サイドバー・ヘッダー・フッター・PlayerQueuePanel を含む共通レイアウト。
- `components/layout/Footer.vue`: 現在再生中の曲情報・プログレスバー・コントロール UI。
- **[新規実装]** `components/SongRow.vue`: 楽曲行コンポーネント（サムネイル・情報・操作ボタン）
- **[新規実装]** `components/SongList.vue`: 楽曲リストコンポーネント（複数楽曲の表示管理）
- **[新規実装]** `pages/songs/index.vue`: 楽曲一覧ページ（検索・フィルター・ソート機能付き）

### 3.6 ナビゲーション・設定

- **[更新]** `components/layout/Sidebar.vue`: 楽曲一覧リンクを追加、未実装ページは無効化
- **[新規追加]** `.env.example`: 環境変数設定のテンプレート

### 3.7 エラー・バグ対応

- `player.currentTrack`が null の場合のガードを全箇所に追加。
- computed, 関数, テンプレートで null チェックを徹底。

## 4. 今後の実装予定・拡張案

### 4.1 優先度高（次回実装予定）

- **YouTube Player API 統合**: 実際の楽曲再生機能
- **SongRow の完全実装**: 動画サムネイル表示、再生状態の可視化
- **プレイヤー UI の完成**: 再生/一時停止、シーク、音量調整
- **ページネーション**: 大量楽曲データへの対応

### 4.2 中期的な拡張

- プレイリスト作成・編集・削除 UI の完全実装
- LocalStorage 連携による再生キューのセッション保存
- 「現在の再生キューをプレイリスト化」API 連携
- プレイヤーのリピート・シャッフル・履歴管理機能
- **お気に入り機能**: 楽曲・プレイリストのブックマーク
- **楽曲詳細ページ**: 動画情報、関連楽曲、コメント表示

### 4.3 長期的な拡張

- 認証・ユーザー管理（必要に応じて）
- **ソーシャル機能**: プレイリスト共有、コメント投稿
- **レコメンド機能**: 視聴履歴ベースの楽曲推薦
- **統計・分析**: 再生回数、人気楽曲ランキング
- **PWA 対応**: オフライン再生、プッシュ通知
- テスト・Linter・CI/CD の整備

## 5. 技術的な成果・学習ポイント

### 5.1 今回の実装で得られた知見

- **Nuxt3 Server API**: `/server/api/` での API プロキシ実装パターン
- **環境変数管理**: `runtimeConfig` と `.env` の効果的な活用
- **Composables 設計**: 型安全で再利用可能な API 通信ロジック
- **Vue 3 + TypeScript**: script setup での効率的なコンポーネント開発
- **エラーハンドリング**: API プロキシでの例外処理とフロントエンドでの表示

### 5.2 アーキテクチャの優位性

- **レイヤー分離**: API 通信（server/api）→ Composables → UI の明確な責務分離
- **型安全性**: Django REST API レスポンスから UI まで一貫した型管理
- **開発効率**: ホットリロード、TypeScript IntelliSense による快適な開発体験
- **保守性**: 各機能の独立性が高く、機能追加・修正が容易

## 6. 参考: 現在のディレクトリ構成

```
components/
  SongList.vue            # [新規] 楽曲リスト表示
  SongRow.vue             # [新規] 楽曲行コンポーネント
  PlayerQueuePanel.vue
  layout/
    Footer.vue
    Header.vue
    Sidebar.vue           # [更新] 楽曲一覧リンク追加
composables/
  usePlaylist.ts
  useSongs.ts             # [拡張] 検索・フィルター機能
  useVideos.ts            # [拡張] 動画検索機能
layouts/
  default.vue
pages/
  playlists.vue
  playlists/[id].vue
  songs/
    index.vue             # [新規] 楽曲一覧ページ
server/
  api/
    songs/
      index.get.ts        # [新規] 楽曲APIプロキシ
    videos/
      index.get.ts        # [新規] 動画APIプロキシ
    random.get.ts         # [新規] ランダム楽曲API
stores/
  player.ts
  usePlayerQueue.ts
types/
  song.ts
  video.ts
  channel.ts
  playlist.ts
utils/
  api.ts                  # [新規] 共通APIユーティリティ
```

## 7. 開発作業ログ

### 2025-06-25: API プロキシと楽曲一覧機能の実装

**作業時間**: 約 3 時間  
**コミット**: `feat: APIプロキシと楽曲一覧機能の実装` (23d82b2)

#### 実装内容

1. **API プロキシレイヤーの構築**

   - Django REST API との安全な通信を実現
   - エラーハンドリングと型安全性を確保
   - 環境変数による設定管理

2. **楽曲一覧機能の完全実装**

   - 検索・フィルター・ソート機能
   - モダンな UI/UX（Tailwind CSS）
   - レスポンシブデザイン対応

3. **コンポーネント設計**
   - 再利用可能な SongRow/SongList コンポーネント
   - Vue 3 Composition API による効率的な実装
   - Props/Emits による適切なデータフロー

#### 技術的な課題と解決

- **ESLint 設定**: Vue 3 + TypeScript 環境での厳密な型チェック
- **API 通信**: $fetch を使用した Nuxt3 標準の通信方式
- **状態管理**: composables でのリアクティブデータ管理

#### 検証結果

- Django REST API（http://127.0.0.1:8000/api/）との通信: ✅ 正常
- 楽曲一覧表示（/songs）: ✅ 動作確認済み
- 検索・フィルター機能: ✅ 動作確認済み
- レスポンシブデザイン: ✅ モバイル・デスクトップ対応

#### 次回への引き継ぎ

- YouTube Player API 統合の準備完了
- SongRow コンポーネントの動画再生連携
- プレイヤー UI 統合への基盤整備完了

---

## 7. 歌枠一覧機能の実装（2025-01-26）

### 7.1 実装背景・課題整理

**背景**

- 楽曲一覧（`pages/songs/index.vue`）は「歌動画」と「歌枠内楽曲」の両方を含む
- 利用者が「歌枠」単位で配信を探したい場合、専用ページが必要
- Videos API の `is_stream: true` が歌枠、`false` が歌動画を示す
- タスクリストでは「歌枠一覧プロトタイプ実装」が完了扱いだったが、実際には未実装だった

**課題**

- 利用者の「歌枠を探す」ニーズに対応するページが存在しない
- 楽曲一覧と歌枠一覧の区別が不明確

### 7.2 設計方針

**歌枠一覧の要件**

- `is_stream: true` の video のみを表示
- 歌枠タイトル、配信日時、チャンネル名、サムネイルを表示
- 歌枠から楽曲一覧への遷移機能
- 検索・フィルター・ソート機能
- 歌枠全体をキューに追加する機能（将来実装）

**UI 設計原則**

- 楽曲一覧ページと統一感のあるデザイン
- レスポンシブ対応
- 既存の SongRow/SongList パターンを参考に StreamRow/StreamList 構成

### 7.3 実装詳細

**新規作成ファイル**

1. `pages/streams/index.vue` - 歌枠一覧メインページ
2. `components/StreamRow.vue` - 個別歌枠表示コンポーネント
3. `components/StreamList.vue` - 歌枠リスト表示コンポーネント

**修正ファイル**

1. `components/layout/Sidebar.vue` - ナビゲーションに「🎤 歌枠一覧」リンク追加
2. `docs/todays_tasks.md` - 実装タスクの進捗追加

**技術実装**

- `useVideos` composable を活用し、`is_stream: true`でフィルター
- 検索・ソート・フィルター機能は楽曲一覧と同様の実装パターン
- デバウンス機能付き検索
- エラーハンドリング・ローディング状態管理

**イベント設計**

- `@view-songs`: 歌枠の楽曲一覧へ遷移（`/songs?video_id=${stream.id}`）
- `@add-stream-to-queue`: 歌枠全体をキューに追加（TODO）

### 7.4 残課題・次期実装

**短期課題**

- [ ] デフォルトサムネイル画像の設置
- [ ] 各歌枠の楽曲数表示機能（Songs API から count を取得）
- [ ] 歌枠詳細ページの検討
- [ ] 型安全性の改善（any 型の解消）

**中期課題**

- [ ] 歌枠 → 楽曲一覧遷移時の UX 最適化
- [ ] 歌枠全体のキュー追加機能（Player 機能実装後）
- [ ] サムネイル画像の最適化・CDN 対応

### 7.5 設計判断の理由

**URL パス選択**: `/streams/`

- 「歌枠」の英語表現として適切
- `/songs/` との対比で分かりやすい

**コンポーネント分離**: StreamRow/StreamList

- 既存の SongRow/SongList パターンと統一
- 歌枠特有の UI 要素（配信日時、チャンネル名など）に特化

**API 活用**: 既存の`useVideos`を再利用

- 新規 API エンドポイント不要
- フィルター機能で歌枠のみ抽出

このドキュメントは、今後の開発・意思決定の記録として随時更新してください。
