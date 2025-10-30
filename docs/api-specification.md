# Django REST API 仕様書

## 概要

このドキュメントは、Django REST Framework で実装されたバックエンド API の詳細仕様を定義します。

**ベース URL**: `http://127.0.0.1:8000/api/`（開発環境）

---

## 共通仕様

### 認証

現在、認証は不要です（将来的に実装予定）。

### レスポンス形式

すべてのレスポンスは JSON 形式です。

**Django Dynamic REST (DREST)** を使用しており、高度なクエリ機能をサポートしています。

### エラーレスポンス

```json
{
  "detail": "エラーメッセージ",
  "status": 400
}
```

### ページネーション

リスト取得 API は以下の形式でページネーションをサポートします：

```json
{
  "count": 100,
  "next": "http://127.0.0.1:8000/api/songs/?page=2",
  "previous": null,
  "results": [...]
}
```

**クエリパラメータ**:

- `page`: ページ番号（デフォルト: 1）
- `page_size`: 1 ページあたりの件数（デフォルト: 50）

---

## Dynamic REST 高度なクエリ機能

Django Dynamic REST (DREST) により、以下の強力なクエリパラメータが使用できます。

### 1. フィルタリング (`filter{}`)

**基本的なフィルタリング**:

```
GET /api/songs/?filter{title}=君に送る歌
GET /api/songs/?filter{is_original}=true
```

**部分一致検索**:

```
GET /api/songs/?filter{title.icontains}=君
GET /api/songs/?filter{artist.istartswith}=戌亥
```

**比較演算子**:

```
GET /api/songs/?filter{start_at.gt}=100
GET /api/songs/?filter{start_at.lt}=200
GET /api/songs/?filter{start_at.range}=100,200
```

**IN 検索（複数値）**:

```
GET /api/songs/?filter{id.in}=1&filter{id.in}=2&filter{id.in}=3
GET /api/songs/?filter{artist.in}=YOASOBI&filter{artist.in}=Aimer
```

**関連フィールドのフィルタリング**:

```
GET /api/songs/?filter{video.is_stream}=true
GET /api/songs/?filter{video.title.icontains}=歌枠
```

**否定フィルタ（`-`プレフィックス）**:

```
GET /api/songs/?filter{-is_original}=false
```

**サポートされるフィルタ演算子**:

- `icontains`: 大文字小文字を区別しない部分一致
- `istartswith`: 大文字小文字を区別しない前方一致
- `iendswith`: 大文字小文字を区別しない後方一致
- `in`: 複数値のいずれかに一致
- `range`: 範囲指定
- `gt`: より大きい
- `gte`: 以上
- `lt`: より小さい
- `lte`: 以下
- `isnull`: NULL 判定

### 2. ソート (`sort[]`)

**単一フィールドでソート**:

```
GET /api/songs/?sort[]=title
GET /api/songs/?sort[]=-published_at  # 降順（-プレフィックス）
```

**複数フィールドでソート**:

```
GET /api/songs/?sort[]=is_original&sort[]=-start_at
```

**関連フィールドでソート（ドット記法）**:

```
GET /api/songs/?sort[]=video.published_at
GET /api/songs/?sort[]=-video.title
```

### 3. フィールド包含 (`include[]`)

**関連データのサイドロード（Sideloading）**:

```
# 楽曲と一緒に動画情報を含める
GET /api/songs/?include[]=video.*

# 複数の関連データを含める
GET /api/songs/?include[]=video.*&include[]=video.channel.*
```

**ネストした関連データの包含**:

```
# 動画とそのチャンネル情報も含める
GET /api/songs/?include[]=video.channel.*
```

**遅延フィールドの包含**:

```
# デフォルトでは返されないフィールドを明示的に要求
GET /api/songs/?include[]=description
```

**レスポンス例（サイドロード）**:

```json
{
  "songs": [
    {
      "id": 1,
      "title": "君に送る歌",
      "artist": "戌亥とこ",
      "video": "abc123"
    }
  ],
  "videos": [
    {
      "id": "abc123",
      "title": "【歌枠】楽しい歌枠",
      "url": "https://youtube.com/watch?v=abc123"
    }
  ]
}
```

### 4. フィールド除外 (`exclude[]`)

**特定のフィールドを除外**:

```
GET /api/songs/?exclude[]=video
GET /api/songs/?exclude[]=start_at&exclude[]=end_at
```

**関連フィールドを除外（ドット記法）**:

```
GET /api/songs/?include[]=video.*&exclude[]=video.thumbnail_path
```

**すべて除外して特定のフィールドのみ取得**:

```
# ワイルドカードで全除外 + include で必要なものだけ取得
GET /api/songs/?exclude[]=*&include[]=id&include[]=title
```

**レスポンス例**:

```json
{
  "songs": [
    {
      "id": 1,
      "title": "君に送る歌",
      "links": {
        "video": "/songs/1/video"
      }
    }
  ]
}
```

### 5. サイドロード時のフィルタリング（パイプ記法）

サイドロードされた関連データに対してもフィルタを適用できます：

```
# すべての楽曲を取得し、歌枠の動画のみをサイドロード
GET /api/songs/?include[]=video.*&filter{video|is_stream}=true

# すべてのユーザーを取得し、名前に「と」が含まれるアーティストの曲のみをサイドロード
GET /api/songs/?include[]=video.*&filter{video|title.icontains}=歌枠
```

### 6. 複合クエリの例

**実用的な組み合わせ例**:

```
# オリジナル曲を新しい順にソートし、動画情報も含める
GET /api/songs/?filter{is_original}=true&sort[]=-start_at&include[]=video.*

# 特定の動画の楽曲を取得し、サムネイルを除外
GET /api/songs/?filter{video}=abc123&include[]=video.*&exclude[]=video.thumbnail_path

# 歌枠の楽曲を検索し、タイトルと動画URLのみ取得
GET /api/songs/?filter{video.is_stream}=true&filter{title.icontains}=夜&exclude[]=*&include[]=id&include[]=title&include[]=video.url

# タイトルで検索、アーティスト名でソート、ページネーション
GET /api/songs/?filter{title.icontains}=love&sort[]=artist&page=1&page_size=20
```

### 7. パフォーマンス最適化

Dynamic REST は以下の最適化を自動的に実行します：

- **N+1 クエリの防止**: `include[]` を使用した場合、Django の `prefetch_related` / `select_related` を自動的に使用
- **不要なフィールドの除外**: `exclude[]` により、データベースから取得するフィールドを最小化
- **効率的なシリアライズ**: 必要なデータのみをシリアライズ

### 8. エラーハンドリング

**無効なフィルタ**:

```json
{
  "detail": "Invalid filter field: 'nonexistent_field'",
  "status": 400
}
```

**無効なソートフィールド**:

```json
{
  "detail": "Invalid sort field: 'invalid_field'",
  "status": 400
}
```

---

## エンドポイント一覧

### 1. 動画（Videos）

### 2. 動画（Videos）

#### GET /api/videos/

**説明**: 動画一覧を取得（歌動画と歌枠の両方を含む）

**基本クエリパラメータ**:

- `search`: 文字列（動画タイトルでの簡易検索）
- `page`: ページ番号
- `page_size`: 1 ページあたりの件数

**Dynamic REST パラメータ** (推奨):

- `filter{field}=value`: フィールドでフィルタリング
  - 例: `filter{is_stream}=true`（歌枠のみ）
  - 例: `filter{is_stream}=false`（歌動画のみ）
  - 例: `filter{is_open}=true`（公開動画のみ）
  - 例: `filter{is_member_only}=false`（メンバー限定を除外）
  - 例: `filter{title.icontains}=歌枠`（タイトル部分一致）
- `sort[]=field`: ソート
  - 例: `sort[]=published_at`（公開日昇順）
  - 例: `sort[]=-published_at`（公開日降順、デフォルト）
  - 例: `sort[]=title`（タイトル昇順）
- `include[]=relation.*`: 関連データを含める
  - 例: `include[]=songs.*`（楽曲情報をサイドロード）
- `exclude[]=field`: フィールドを除外
  - 例: `exclude[]=thumbnail_path`（サムネイル URL を除外）

**レスポンス例**:

```json
{
  "videos": [
    {
      "id": "zokUrGt0iuc",
      "title": "【歌ってみた】一度だけの恋なら【とこりぜるる】",
      "url": "https://www.youtube.com/watch?v=zokUrGt0iuc",
      "thumbnail_path": "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/zokUrGt0iuc.jpg",
      "is_open": true,
      "is_member_only": false,
      "is_stream": false,
      "unplayable": false,
      "published_at": "2020-05-04T05:00:00+09:00",
      "songs_count": 1
    }
  ]
}
```

**型定義** (`types/video.ts`):

```typescript
export interface Video {
  id: string; // YouTube動画ID
  title: string;
  url: string;
  thumbnail_path: string;
  is_open: boolean;
  is_member_only: boolean;
  is_stream: boolean;
  unplayable: boolean;
  published_at: string;
  songs_count?: number; // リストエンドポイントのみ
  songs?: Song[]; // 詳細エンドポイントまたはinclude[]使用時
}
```

**注意**:

- レスポンスのトップレベルキーは `videos`（複数形）
- リストエンドポイントでは `songs_count` のみが返され、実際の楽曲データは含まれない
- `include[]=songs.*` を使用すると楽曲データをサイドロードできる

#### GET /api/videos/:id/

**説明**: 特定の動画詳細を取得（楽曲リスト含む）

**レスポンス例**:

```json
{
  "video": {
    "id": "zokUrGt0iuc",
    "title": "【歌ってみた】一度だけの恋なら【とこりぜるる】",
    "url": "https://www.youtube.com/watch?v=zokUrGt0iuc",
    "thumbnail_path": "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/zokUrGt0iuc.jpg",
    "is_open": true,
    "is_member_only": false,
    "is_stream": false,
    "unplayable": false,
    "published_at": "2020-05-04T05:00:00+09:00",
    "songs": [
      {
        "id": 1,
        "title": "一度だけの恋なら",
        "artist": "ワルキューレ",
        "is_original": false,
        "start_at": 0,
        "end_at": 253
      }
    ],
    "links": {
      "songs": "songs/"
    }
  }
}
```

**注意**:

- レスポンスのトップレベルキーは `video`（単数形）
- 詳細エンドポイントでは自動的に `songs` 配列が含まれる

---

### 2. 楽曲（Songs）

#### GET /api/songs/

**説明**: 楽曲一覧を取得

**基本クエリパラメータ**:

- `search`: 文字列（楽曲タイトル・アーティスト名での簡易検索）
- `page`: ページ番号
- `page_size`: 1 ページあたりの件数

**Dynamic REST パラメータ** (推奨):

- `filter{field}=value`: フィールドでフィルタリング
  - 例: `filter{is_original}=true`
  - 例: `filter{title.icontains}=君`
  - 例: `filter{video}=abc123`（動画 ID でフィルター）
  - 例: `filter{video.is_stream}=true`（歌枠の楽曲のみ）
- `sort[]=field`: ソート
  - 例: `sort[]=title`（昇順）
  - 例: `sort[]=-start_at`（降順）
- `include[]=relation.*`: 関連データを含める
  - 例: `include[]=video.*`（動画情報をサイドロード）
- `exclude[]=field`: フィールドを除外
  - 例: `exclude[]=video`（動画情報を除外）

**レスポンス例**:

```json
{
  "songs": [
    {
      "id": 406,
      "video": {
        "id": "VV_MJFmNWo0",
        "title": "【告知と歌！】ソロライブの円盤が発売されるぞ～～～～！！【戌亥とこ/にじさんじ】",
        "url": "https://www.youtube.com/watch?v=VV_MJFmNWo0",
        "thumbnail_path": "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/VV_MJFmNWo0.jpg",
        "is_open": true,
        "is_member_only": false,
        "is_stream": true,
        "unplayable": false,
        "published_at": "2021-07-15T18:59:07+09:00"
      },
      "title": "優しい彗星",
      "artist": "YOASOBI",
      "is_original": false,
      "start_at": 2789,
      "end_at": 3008
    }
  ]
}
```

**型定義** (`types/song.ts`):

```typescript
export interface Song {
  id: number;
  video: Video; // 常にネストされたVideoオブジェクト
  title: string;
  artist: string;
  is_original: boolean;
  start_at: number; // 秒単位
  end_at: number; // 秒単位
}
```

**注意**:

- レスポンスのトップレベルキーは `songs`（複数形）
- `video` フィールドは常に完全なオブジェクトとしてネストされている
- リストエンドポイントでもデフォルトで動画情報が含まれる（`include[]` 不要）

#### GET /api/songs/:id/

**説明**: 特定の楽曲詳細を取得

**レスポンス例**:

```json
{
  "song": {
    "id": 1,
    "video": {
      "id": "zokUrGt0iuc",
      "title": "【歌ってみた】一度だけの恋なら【とこりぜるる】",
      "url": "https://www.youtube.com/watch?v=zokUrGt0iuc",
      "thumbnail_path": "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/zokUrGt0iuc.jpg",
      "is_open": true,
      "is_member_only": false,
      "is_stream": false,
      "unplayable": false,
      "published_at": "2020-05-04T05:00:00+09:00"
    },
    "title": "一度だけの恋なら",
    "artist": "ワルキューレ",
    "is_original": false,
    "start_at": 0,
    "end_at": 253
  }
}
```

**注意**:

- レスポンスのトップレベルキーは `song`（単数形）

---

### 3. ランダム楽曲

#### GET /api/random/

**説明**: ランダムに複数の楽曲を取得

**クエリパラメータ**:

- `limit`: number (取得する楽曲の数、デフォルトは 50)
- `is_original`: boolean (オリジナル曲のみに絞る)

**レスポンス例**:

```json
[
  {
    "video": {
      "id": "zokUrGt0iuc",
      "title": "【歌ってみた】一度だけの恋なら【とこりぜるる】",
      "url": "https://www.youtube.com/watch?v=zokUrGt0iuc",
      "thumbnail_path": "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/zokUrGt0iuc.jpg",
      "is_open": true,
      "is_member_only": false,
      "is_stream": false,
      "unplayable": false,
      "published_at": "2020-05-04T05:00:00+09:00"
    },
    "id": 1,
    "title": "一度だけの恋なら",
    "artist": "ワルキューレ",
    "is_original": false,
    "start_at": 0,
    "end_at": 253
  },
  {
    "video": {
      "id": "SgdIulgNKa4",
      "title": "【重大告知あり】Nornis 1st Mini Album『Tensegrity』リリース決定記念トーク&ミニライブ",
      "url": "https://www.youtube.com/watch?v=SgdIulgNKa4",
      "thumbnail_path": "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/SgdIulgNKa4.jpg",
      "is_open": true,
      "is_member_only": false,
      "is_stream": true,
      "unplayable": false,
      "published_at": "2024-04-23T21:08:31+09:00"
    },
    "id": 659,
    "title": "Daydreamer",
    "artist": "Nornis",
    "is_original": true,
    "start_at": 60,
    "end_at": 293
  }
]
```

**レスポンス型**: `Song[]` 配列（各楽曲に動画情報を含む）

**注意**:

- レスポンスは直接 `Song` オブジェクトの配列
- トップレベルのキーは存在しない（配列がルート）
- 各楽曲に完全な動画情報が含まれる
- デフォルトで 50 曲が返される

---

### 4. プレイリスト（Playlists）

#### GET /api/playlists/

**説明**: プレイリスト一覧を取得

**クエリパラメータ**:

- `search`: 文字列（プレイリスト名での部分一致検索）
- `ordering`: 文字列（ソート順）
  - `name`: 名前昇順
  - `-name`: 名前降順
  - `created_at`: 作成日時昇順
  - `-created_at`: 作成日時降順（デフォルト）

**レスポンス例**:

```json
[
  {
    "id": 1,
    "name": "お気に入りのオリジナル曲",
    "description": "戌亥とこのオリジナル曲まとめ",
    "created_at": "2024-10-01T00:00:00+09:00",
    "items": [
      {
        "id": 1,
        "order": 0,
        "song": {
          "id": 10,
          "video": {
            "id": "abc123",
            "title": "【歌ってみた】素敵な曲",
            "url": "https://www.youtube.com/watch?v=abc123",
            "thumbnail_path": "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/abc123.jpg",
            "is_open": true,
            "is_member_only": false,
            "is_stream": false,
            "unplayable": false,
            "published_at": "2024-01-01T00:00:00+09:00"
          },
          "title": "素敵な曲",
          "artist": "戌亥とこ",
          "is_original": true,
          "start_at": 0,
          "end_at": 240
        }
      }
    ]
  }
]
```

**型定義** (`types/playlist.ts`):

```typescript
export interface PlaylistItem {
  id: number;
  order: number;
  song: Song;
}

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  items: PlaylistItem[];
}
```

**注意**:

- レスポンスは直接 `Playlist` オブジェクトの配列
- 各アイテムに完全な楽曲情報（動画情報含む）が含まれる

#### GET /api/playlists/:id/

**説明**: 特定のプレイリスト詳細を取得

**レスポンス**: 単一の `Playlist` オブジェクト（上記と同じ構造）

#### POST /api/playlists/

**説明**: 新しいプレイリストを作成

**リクエストボディ**:

```json
{
  "name": "新しいプレイリスト",
  "description": "説明（任意）",
  "items": [
    {
      "song_id": 10,
      "order": 0
    },
    {
      "song_id": 42,
      "order": 1
    }
  ]
}
```

**レスポンス**: 作成された `Playlist` オブジェクト

#### PUT /api/playlists/:id/

**説明**: プレイリストを完全更新

**リクエストボディ**: POST と同じ形式

**レスポンス**: 更新された `Playlist` オブジェクト

#### PATCH /api/playlists/:id/

**説明**: プレイリストを部分更新

**リクエストボディ**: 更新したいフィールドのみ

```json
{
  "name": "更新後の名前"
}
```

**レスポンス**: 更新された `Playlist` オブジェクト

#### DELETE /api/playlists/:id/

**説明**: プレイリストを削除

**レスポンス**: 204 No Content

---

## Nuxt 4 Server API プロキシ

Nuxt 4 の `server/api/` ディレクトリで Django API をプロキシしています。

### プロキシエンドポイント

- `GET /api/songs` → Django `/api/songs/`
- `GET /api/videos` → Django `/api/videos/`
- `GET /api/random` → Django `/api/random/`
- `GET /api/playlists` → Django `/api/playlists/`

### 使用例

```typescript
// composables/useSongs.ts
export const useSongs = () => {
  const fetchSongs = async (params?: SongSearchParams) => {
    const { data, error } = await useAsyncData("songs", () =>
      $fetch("/api/songs", { params })
    );
    return { data, error };
  };

  return { fetchSongs };
};
```

---

## エラーパターン

### 400 Bad Request

無効なクエリパラメータや不正なリクエストボディ

```json
{
  "detail": "無効なパラメータです",
  "status": 400
}
```

### 404 Not Found

リソースが存在しない

```json
{
  "detail": "見つかりませんでした。",
  "status": 404
}
```

### 500 Internal Server Error

サーバー側のエラー

```json
{
  "detail": "サーバーエラーが発生しました",
  "status": 500
}
```

---

## 今後の拡張予定

- [ ] 認証・認可機能の追加
- [ ] ユーザー管理 API
- [ ] お気に入り機能 API
- [ ] 再生履歴 API
- [ ] レコメンド機能 API
- [ ] 統計・分析 API
- [ ] WebSocket による リアルタイム更新

---

## 実践的な使用例

### よくある検索パターン

#### 1. 歌枠の最新楽曲を取得

```typescript
// composables/useSongs.ts
const fetchLatestStreamSongs = async () => {
  const params = {
    "filter{video.is_stream}": "true",
    "sort[]": "-video.published_at",
    page_size: 20,
  };

  return await $fetch("/api/songs", { params });
};
```

**注意**: `/api/songs/` は常にデフォルトで動画情報を含むため、`include[]=video.*` は不要

#### 2. オリジナル曲のみを取得

```typescript
const fetchOriginalSongs = async () => {
  const params = {
    "filter{is_original}": "true",
    "sort[]": "-video.published_at",
  };

  return await $fetch("/api/songs", { params });
};
```

**注意**: `/api/songs/` は常にデフォルトで動画情報を含むため、`include[]=video.*` は不要

#### 3. 特定の動画の楽曲リストを取得

```typescript
const fetchSongsByVideo = async (videoId: string) => {
  const params = {
    "filter{video.id}": videoId, // video.id でフィルタ
    "sort[]": "start_at",
  };

  return await $fetch("/api/songs", { params });
};
```

#### 4. タイトル検索（軽量レスポンス）

```typescript
const searchSongsByTitle = async (query: string) => {
  const params = {
    "filter{title.icontains}": query,
    "exclude[]": "video", // 動画情報を除外して軽量化
    page_size: 50,
  };

  return await $fetch("/api/songs", { params });
};
```

#### 5. 複雑な検索（アーティストとタイトルの AND 検索）

```typescript
const advancedSearch = async (artist: string, title: string) => {
  const params = {
    "filter{artist.icontains}": artist,
    "filter{title.icontains}": title,
    "sort[]": "-video.published_at",
  };

  return await $fetch("/api/songs", { params });
};
```

**注意**: `/api/songs/` は常にデフォルトで動画情報を含むため、`include[]=video.*` は不要

#### 6. ID とタイトルのみ取得（超軽量）

```typescript
const fetchSongIdsAndTitles = async () => {
  const params = {
    "exclude[]": "*",
    "include[]": "id",
    "include[]": "title",
    page_size: 100,
  };

  return await $fetch("/api/songs", { params });
};
```

### パフォーマンスのベストプラクティス

#### ✅ 推奨パターン

```typescript
// 1. 動画情報を除外して軽量化（必要な場合のみ）
const params = {
  "exclude[]": "video", // Songsエンドポイントはデフォルトでvideoを含むため、不要なら除外
};

// 2. フィルタリングをサーバー側で実行
const params = {
  "filter{is_original}": "true", // クライアント側でフィルタするより効率的
  "filter{video.is_stream}": "true",
};

// 3. ソートもサーバー側で実行
const params = {
  "sort[]": "-video.published_at", // データベースレベルでソート
};
```

#### ❌ 非推奨パターン

```typescript
// 1. すべてのデータを取得してクライアント側でフィルタ
const allSongs = await $fetch("/api/songs"); // ❌ 重い
const filtered = allSongs.filter((s) => s.is_original); // ❌ 非効率

// 代わりに:
const songs = await $fetch("/api/songs", {
  params: { "filter{is_original}": "true" }, // ✅ サーバー側でフィルタ
});

// 2. 個別にリクエストを繰り返す
for (const songId of songIds) {
  // ❌ N+1問題
  const song = await $fetch(`/api/songs/${songId}`);
}

// 代わりに:
const songs = await $fetch("/api/songs", {
  params: { "filter{id.in}": songIds }, // ✅ 一括取得
});
```

### Nuxt 4 Server API プロキシでの実装例

```typescript
// server/api/songs/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();

  // Dynamic REST パラメータをそのまま転送
  const params = new URLSearchParams();

  // filter{} パラメータ
  Object.keys(query).forEach((key) => {
    if (
      key.startsWith("filter{") ||
      key.startsWith("sort[") ||
      key.startsWith("include[") ||
      key.startsWith("exclude[")
    ) {
      params.append(key, query[key] as string);
    }
  });

  // その他のパラメータ
  if (query.page) params.append("page", query.page as string);
  if (query.page_size) params.append("page_size", query.page_size as string);

  const response = await $fetch(
    `${config.public.djangoApiUrl}/api/songs/?${params.toString()}`
  );

  return response;
});
```

---

## 関連ドキュメント

- [Django Dynamic REST 公式ドキュメント](http://dynamic-rest.readthedocs.org/)
- [Django Dynamic REST GitHub](https://github.com/AltSchool/dynamic-rest)
- [プロジェクト目的](./project-purpose.md)
- [型定義](../types/)
- [Composables](../composables/)
- [Server API](../server/api/)
