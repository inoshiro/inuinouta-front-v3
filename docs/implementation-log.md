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

### 3.3 Pinia ストア

- `stores/player.ts`: 現在再生中の曲・状態を管理。
- `stores/usePlayerQueue.ts`: 再生キュー（QueueItem[]）と再生インデックスを管理。

### 3.4 UI コンポーネント

- `pages/playlists.vue`: プレイリスト一覧表示。詳細ページへの遷移ボタンあり。
- `pages/playlists/[id].vue`: プレイリスト詳細・曲リスト・「再生」「キューに追加」ボタン。
- `components/PlayerQueuePanel.vue`: 再生キューの中身・再生・スキップ・クリア操作 UI。
- `layouts/default.vue`: サイドバー・ヘッダー・フッター・PlayerQueuePanel を含む共通レイアウト。
- `components/layout/Footer.vue`: 現在再生中の曲情報・プログレスバー・コントロール UI。

### 3.5 エラー・バグ対応

- `player.currentTrack`が null の場合のガードを全箇所に追加。
- computed, 関数, テンプレートで null チェックを徹底。

## 4. 今後の実装予定・拡張案

- 楽曲リスト（SongList.vue, SongRow.vue）や検索 UI の追加。
- プレイリスト作成・編集・削除 UI。
- LocalStorage 連携による再生キューのセッション保存。
- 「現在の再生キューをプレイリスト化」API 連携。
- プレイヤーのリピート・シャッフル・履歴管理機能。
- 認証・ユーザー管理（必要に応じて）。
- テスト・Linter・CI/CD の整備。

## 5. 参考: ディレクトリ構成例

```
components/
  PlayerQueuePanel.vue
  layout/
    Footer.vue
composables/
  usePlaylist.ts
  useSongs.ts
  useVideos.ts
layouts/
  default.vue
pages/
  playlists.vue
  playlists/[id].vue
stores/
  player.ts
  usePlayerQueue.ts
types/
  song.ts
  video.ts
  channel.ts
  playlist.ts
```

## 6. サーバサイド（Django）モデル設計の優先理由と設計例

### 6.1 なぜサーバ側モデル設計を先に行うべきか

- API 仕様が確定し、フロントエンドの型定義・実装がスムーズになる
- 「永続データ（プレイリスト）」と「一時データ（再生キュー）」の責務分離が明確になる
- 将来的なユーザー機能拡張にも柔軟に対応できる

### 6.2 最低限必要な Django モデル案

```python
from django.db import models

class Playlist(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # owner = models.ForeignKey(User, on_delete=models.CASCADE)  # ユーザー紐付け（将来拡張）

class PlaylistItem(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name='items')
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    order = models.PositiveIntegerField()  # 再生順序
```

- PlaylistItem で多対多＋順序保持を実現（through モデル）
- 既存の Song モデルを流用

### 6.3 API 設計例（Django REST Framework）

| エンドポイント         | メソッド  | 説明                           |
| ---------------------- | --------- | ------------------------------ |
| `/api/playlists/`      | GET       | 全プレイリスト一覧             |
| `/api/playlists/{id}/` | GET       | プレイリスト詳細（songs 含む） |
| `/api/playlists/`      | POST      | 新規作成                       |
| `/api/playlists/{id}/` | PUT/PATCH | 名前・曲順などを更新           |
| `/api/playlists/{id}/` | DELETE    | 削除                           |

---

このドキュメントは、今後の開発・意思決定の記録として随時更新してください。
