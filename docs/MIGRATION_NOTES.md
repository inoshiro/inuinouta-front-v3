# 実装と API 間の差異に関する注記

## 概要

このドキュメントは、フロントエンド実装とバックエンド API 間の差異、および将来実装予定の機能について記載します。

---

## ✅ 修正完了：Playlist エンドポイント

**状況**: 2025-10-25 修正完了

Django 側の実装は完了していましたが、メインの URL 設定（`inuinouta/urls.py`）にルーティングが登録されていませんでした。

**修正内容**:

- ✅ `inuinouta/urls.py` に PlaylistViewSet のルーティングを追加
- ✅ `/api/playlists/` エンドポイントが正常に動作することを確認

**実装済みの内容**:

- ✅ `models.py` - Playlist, PlaylistItem モデル
- ✅ `serializers.py` - PlaylistSerializer, PlaylistItemSerializer
- ✅ `views.py` - PlaylistViewSet（ModelViewSet、CRUD 対応）
- ✅ URL ルーティング - メインルーターに登録済み

**API エンドポイント**:

- ✅ `GET /api/playlists/` - プレイリスト一覧
- ✅ `GET /api/playlists/:id/` - プレイリスト詳細
- ✅ `POST /api/playlists/` - プレイリスト作成
- ✅ `PUT /api/playlists/:id/` - プレイリスト更新
- ✅ `PATCH /api/playlists/:id/` - プレイリスト部分更新
- ✅ `DELETE /api/playlists/:id/` - プレイリスト削除

---

## 🔴 未実装/未使用の機能

### 1. Channel 型定義

**フロントエンド側の実装状況**:

- ✅ `types/channel.ts` - 型定義済み

**バックエンド側の状況**:

- ✅ `Channel` モデルは実装済み
- ❌ `/api/channels/` エンドポイントは**未実装**（API に公開されていない）
- ✅ チャンネル情報は Video モデルに外部キーとして存在

**影響**:

- Channel 型はフロントエンドで使用されていない
- Video API のレスポンスにチャンネル情報は含まれていない
- 削除するか、将来の実装に備えてコメントアウトすることを推奨

**対応方法（将来的にチャンネル情報が必要な場合）**:

- VideoSerializer に channel フィールドを追加
- または `/api/channels/` エンドポイントを新規作成

---

**フロントエンド側の実装状況**:

- ✅ `types/channel.ts` - 型定義済み

**バックエンド側の状況**:

- ❌ `/api/channels/` エンドポイント **未実装**
- ✅ チャンネル情報は Video オブジェクトに含まれることもない（現在の API 仕様では）

**影響**:

- Channel 型は使用されていない
- 削除するか、将来の実装に備えてコメントアウトすることを推奨

---

## 🟡 API 仕様とドキュメント間の差異（修正済み）

### 1. `/api/random/` エンドポイント

**以前のドキュメント記載**:

- 単一の`Song`オブジェクトを返す（`{"song": {...}}`形式）

**実際の API 仕様**:

- `Song`オブジェクトの配列を返す（`[{...}, {...}]`形式）
- デフォルトで 50 曲を返す
- `limit`パラメータで件数を制御可能

**修正内容**:

- ✅ `docs/api-specification.md` - レスポンス形式を配列に修正
- ✅ `server/api/random.get.ts` - 型を`Song`から`Song[]`に修正

### 2. `/api/songs/` と `/api/videos/` のレスポンス形式

**実際の API 仕様**:

- **リストエンドポイント**: 複数形キー（`{"songs": [...]}`, `{"videos": [...]}`）
- **詳細エンドポイント**: 単数形キー（`{"song": {...}}`, `{"video": {...}}`）

**修正内容**:

- ✅ `docs/api-specification.md` - レスポンス形式を正確に記載

### 3. Video 型のフィールド

**以前のドキュメント記載**:

- `channel`フィールドが存在すると記載
- `thumbnail_url`フィールドが存在すると記載

**実際の API 仕様**:

- `channel`フィールドは存在しない
- `thumbnail_path`フィールドを使用

**修正内容**:

- ✅ `types/video.ts` - 実際の API に合わせた型定義
- ✅ `docs/api-specification.md` - 正確なフィールド名を記載
- ✅ `docs/project-purpose.md` - Channel 参照を削除

---

## ✅ 実装と API が一致している機能

以下の機能は正しく実装されており、API と一致しています：

1. ✅ **Songs CRUD**

   - `GET /api/songs/` - リスト取得
   - `GET /api/songs/:id/` - 詳細取得
   - Dynamic REST 対応（filter, sort, include, exclude）

2. ✅ **Videos CRUD**

   - `GET /api/videos/` - リスト取得
   - `GET /api/videos/:id/` - 詳細取得
   - Dynamic REST 対応

3. ✅ **Random Songs**

   - `GET /api/random/` - ランダム楽曲取得（配列）

4. ✅ **Player State Management**

   - Pinia Store (`stores/player.ts`, `stores/usePlayerQueue.ts`)
   - YouTube Player 統合

5. ✅ **Component Architecture**
   - プレゼンテーショナルコンポーネント
   - コンテナコンポーネント
   - SRP 原則に基づいた設計

---

## 📋 今後の作業リスト

### 優先度：高

1. **API ドキュメントの更新**

   - ✅ プレイリストエンドポイントが利用可能になったことを反映
   - `docs/api-specification.md` にプレイリスト API の詳細を追加

2. **未使用の型定義の整理**
   - `types/channel.ts` の削除または将来の実装に備えたコメント化
   - または、VideoSerializer に channel フィールドを追加して使用可能にする

### 優先度：中

1. **認証機能の実装**

   - ユーザー登録・ログイン
   - トークンベース認証
   - プレイリストの所有者管理

2. **お気に入り機能**
   - `/api/favorites/` エンドポイント
   - ユーザーごとのお気に入り管理

### 優先度：低

1. **再生履歴機能**

   - `/api/history/` エンドポイント
   - 再生履歴の記録と取得

2. **レコメンド機能**
   - `/api/recommendations/` エンドポイント
   - ユーザーの視聴履歴に基づくレコメンド

---

## 🔧 開発者向け Tips

### Playlist を無効化する場合

ナビゲーションメニューからプレイリストリンクを削除：

```vue
<!-- layouts/default.vue または該当するナビゲーションコンポーネント -->
<template>
  <nav>
    <NuxtLink to="/">Home</NuxtLink>
    <NuxtLink to="/songs">Songs</NuxtLink>
    <NuxtLink to="/videos">Videos</NuxtLink>
    <!-- プレイリスト機能が実装されるまでコメントアウト -->
    <!-- <NuxtLink to="/playlists">Playlists</NuxtLink> -->
  </nav>
</template>
```

### フロントエンド側で Playlist を実装する場合

LocalStorage を使用した簡易実装例：

```typescript
// composables/useLocalPlaylist.ts
export const useLocalPlaylist = () => {
  const getPlaylists = (): Playlist[] => {
    if (process.client) {
      const data = localStorage.getItem("playlists");
      return data ? JSON.parse(data) : [];
    }
    return [];
  };

  const addPlaylist = (playlist: Omit<Playlist, "id">) => {
    const playlists = getPlaylists();
    const newPlaylist = {
      ...playlist,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    playlists.push(newPlaylist);
    localStorage.setItem("playlists", JSON.stringify(playlists));
    return newPlaylist;
  };

  // ... その他のCRUD操作

  return {
    getPlaylists,
    addPlaylist,
    // ...
  };
};
```

---

## 📝 更新履歴

- **2025-10-25 (修正 2)**: Playlist エンドポイント修正完了
  - Django 側の URL 設定に PlaylistViewSet を追加
  - `/api/playlists/` が正常に動作することを確認
  - Playlist 機能は完全に利用可能
- **2025-10-25 (初版)**: 初版作成
  - API エンドポイント実装状況の確認
  - Playlist 機能のルーティング未登録を確認
  - `/api/random/`のレスポンス形式修正
  - Channel 型の未使用を確認
  - ドキュメントとコードの整合性チェック完了
