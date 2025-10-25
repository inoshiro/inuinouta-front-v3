# プレイリスト機能設計書（LocalStorage 版）

## 📋 概要

ユーザー認証機能が実装されるまでの暫定措置として、LocalStorage を使用したプレイリスト機能を実装します。

**実装方針**:

- LocalStorage にプレイリストデータを保存
- **楽曲情報は LocalStorage に保存せず、楽曲 ID のみを保存**してサイズを最小化
- 表示時に Django API から楽曲情報を取得（`filter{id.in}`で一括取得）
- 将来の認証 API 実装後、同じインターフェースでバックエンド API に切り替え可能な設計
- ユーザーには「ローカル保存」であることを明示

---

## 🎯 機能要件

### 基本機能

1. **プレイリスト一覧表示**

   - 作成したプレイリストのリスト表示
   - プレイリスト名、説明、楽曲数、作成日時を表示

2. **プレイリスト作成**

   - プレイリスト名（必須）
   - 説明文（任意）
   - 作成日時は自動生成

3. **プレイリスト詳細表示**

   - プレイリスト内の楽曲リスト表示
   - 楽曲の並び替え（ドラッグ&ドロップ）
   - 楽曲の削除

4. **楽曲の追加**

   - 楽曲一覧画面から追加
   - 楽曲詳細画面から追加
   - プレイヤーから追加（現在再生中の楽曲）

5. **プレイリスト編集**

   - プレイリスト名の変更
   - 説明文の変更

6. **プレイリスト削除**

   - 確認ダイアログ表示
   - 削除実行

7. **プレイリスト全曲再生**
   - プレイリストの楽曲を再生キューに設定
   - 先頭から再生開始

---

## 🗂️ データ構造

### 設計方針

**LocalStorage には楽曲 ID のみを保存**:

- LocalStorage の容量制限（約 5MB）を考慮
- 楽曲情報（タイトル、アーティスト、動画情報など）は保存しない
- 表示時に Django API から取得（`filter{id.in}`で一括取得）

**メリット**:

- ストレージ使用量を最小化（1 プレイリスト約 1KB 程度）
- 楽曲情報の更新（タイトル修正など）が自動的に反映される
- シンプルなデータ構造

### LocalStorage キー

```typescript
const STORAGE_KEY = "inuinouta_playlists";
```

### データ形式

```typescript
interface LocalPlaylist {
  id: string; // UUID v4
  name: string;
  description?: string;
  created_at: string; // ISO 8601 形式
  updated_at: string; // ISO 8601 形式
  items: LocalPlaylistItem[];
}

interface LocalPlaylistItem {
  id: string; // UUID v4
  song_id: number; // 楽曲ID（Djangoのデータベースと一致）
  order: number; // 並び順（0始まり）
  added_at: string; // ISO 8601 形式
  // 注意: 楽曲情報（Song型）はここに保存しない
}

// LocalStorageに保存される形式
interface LocalPlaylistsData {
  version: string; // データバージョン（例: "1.0"）
  playlists: LocalPlaylist[];
  lastModified: string; // ISO 8601 形式
}
```

**保存例**:

```json
{
  "version": "1.0",
  "lastModified": "2025-10-25T12:00:00+09:00",
  "playlists": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "お気に入りのオリジナル曲",
      "description": "戌亥とこのオリジナル曲まとめ",
      "created_at": "2025-10-20T10:00:00+09:00",
      "updated_at": "2025-10-25T11:30:00+09:00",
      "items": [
        {
          "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          "song_id": 659,
          "order": 0,
          "added_at": "2025-10-20T10:05:00+09:00"
        },
        {
          "id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
          "song_id": 123,
          "order": 1,
          "added_at": "2025-10-21T15:20:00+09:00"
        }
      ]
    }
  ]
}
```

---

## 🔧 技術実装

### 1. Composable: `useLocalPlaylist.ts`

**責務**: LocalStorage の CRUD 操作と楽曲情報の取得を提供

```typescript
// composables/useLocalPlaylist.ts

interface UseLocalPlaylistReturn {
  // State
  playlists: Ref<LocalPlaylist[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;

  // Actions
  loadPlaylists: () => Promise<void>;
  createPlaylist: (data: CreatePlaylistData) => Promise<LocalPlaylist>;
  updatePlaylist: (
    id: string,
    data: UpdatePlaylistData
  ) => Promise<LocalPlaylist>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: number) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, itemId: string) => Promise<void>;
  reorderPlaylistItems: (
    playlistId: string,
    fromIndex: number,
    toIndex: number
  ) => Promise<void>;
  getPlaylistById: (id: string) => LocalPlaylist | null;
  getPlaylistWithSongs: (id: string) => Promise<PlaylistWithSongs | null>;
}

interface CreatePlaylistData {
  name: string;
  description?: string;
}

interface UpdatePlaylistData {
  name?: string;
  description?: string;
}

interface PlaylistWithSongs {
  playlist: LocalPlaylist;
  songs: Song[]; // APIから取得した完全な楽曲データ
}
```

**楽曲情報の取得方法**:

```typescript
// プレイリスト詳細表示時に楽曲情報を一括取得
const getPlaylistWithSongs = async (
  id: string
): Promise<PlaylistWithSongs | null> => {
  const playlist = getPlaylistById(id);
  if (!playlist) return null;

  // 楽曲IDを抽出
  const songIds = playlist.items.map((item) => item.song_id);

  if (songIds.length === 0) {
    return { playlist, songs: [] };
  }

  // Django APIから一括取得（filter{id.in}を使用）
  const params = new URLSearchParams();
  songIds.forEach((id) => {
    params.append("filter{id.in}", id.toString());
  });

  try {
    const response = await $fetch(`/api/songs?${params.toString()}`);
    const songs = response.songs || response; // レスポンス形式に応じて調整

    // プレイリストの並び順でソート
    const sortedSongs = playlist.items
      .map((item) => songs.find((s: Song) => s.id === item.song_id))
      .filter((song): song is Song => song !== undefined);

    return { playlist, songs: sortedSongs };
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    throw error;
  }
};
```

**主要な実装ポイント**:

- LocalStorage には楽曲 ID のみを保存（軽量化）
- 表示時に Django API から楽曲情報を一括取得（N+1 問題を回避）
- すべての操作は非同期（async/await）で統一
- 将来の API 実装と同じインターフェース
- エラーハンドリングを適切に実装
- LocalStorage のサイズ制限（約 5MB）を考慮

### 2. ページコンポーネント

#### `pages/playlists/index.vue` - プレイリスト一覧

**表示内容**:

- プレイリスト一覧（カード形式）
- 各カードに表示:
  - プレイリスト名
  - 説明文（最初の 100 文字）
  - 楽曲数
  - 作成日時
  - サムネイル（最初の 4 曲のサムネイルをグリッド表示）
- 「新規作成」ボタン
- LocalStorage 使用の注意書き

**アクション**:

- プレイリストをクリック → 詳細ページへ遷移
- 「新規作成」ボタン → 作成モーダル表示
- 各カードにメニュー（編集/削除）

#### `pages/playlists/[id].vue` - プレイリスト詳細

**表示内容**:

- プレイリスト情報（名前、説明、楽曲数）
- 楽曲リスト（SongList コンポーネント再利用）
- 「全曲再生」ボタン
- 「編集」ボタン
- 「削除」ボタン

**アクション**:

- 楽曲をクリック → 再生
- 楽曲をキューに追加
- 楽曲を削除（プレイリストから）
- ドラッグ&ドロップで並び替え
- 全曲再生 → 再生キューに設定して再生開始

### 3. コンポーネント

#### `components/PlaylistCard.vue`

**Props**:

```typescript
interface Props {
  playlist: LocalPlaylist;
  thumbnails?: string[]; // 最初の4曲のサムネイル
}
```

**表示内容**:

- プレイリスト名
- 説明文（省略表示）
- 楽曲数
- 作成日時
- サムネイルグリッド（2x2）
- メニューボタン（編集/削除）

#### `components/PlaylistCreateModal.vue`

**Props**:

```typescript
interface Props {
  isOpen: boolean;
}

const emit = defineEmits<{
  close: [];
  created: [playlist: LocalPlaylist];
}>();
```

**フォーム項目**:

- プレイリスト名（必須、最大 100 文字）
- 説明文（任意、最大 500 文字）
- 「作成」ボタン
- 「キャンセル」ボタン

#### `components/PlaylistEditModal.vue`

**Props**:

```typescript
interface Props {
  isOpen: boolean;
  playlist: LocalPlaylist;
}

const emit = defineEmits<{
  close: [];
  updated: [playlist: LocalPlaylist];
}>();
```

#### `components/AddToPlaylistModal.vue`

**Props**:

```typescript
interface Props {
  isOpen: boolean;
  song: Song;
}

const emit = defineEmits<{
  close: [];
  added: [playlistId: string];
}>();
```

**表示内容**:

- プレイリスト一覧（ラジオボタン選択）
- 「新規プレイリストを作成」オプション
- 「追加」ボタン
- 「キャンセル」ボタン

### 4. 既存コンポーネントの拡張

#### `components/SongRow.vue`

**追加する機能**:

- 「プレイリストに追加」ボタン
- クリックで AddToPlaylistModal を表示

**実装**:

```vue
<script setup lang="ts">
  // 既存のコード...

  const showAddToPlaylist = ref(false);

  const handleAddToPlaylist = () => {
    showAddToPlaylist.value = true;
  };

  const handlePlaylistAdded = (playlistId: string) => {
    showAddToPlaylist.value = false;
    // トースト通知: "プレイリストに追加しました"
  };
</script>

<template>
  <!-- 既存のUI... -->

  <button
    @click="handleAddToPlaylist"
    class="p-2 hover:bg-gray-600 rounded-full"
    title="プレイリストに追加"
  >
    <PlusCircleIcon class="w-5 h-5" />
  </button>

  <AddToPlaylistModal
    :is-open="showAddToPlaylist"
    :song="song"
    @close="showAddToPlaylist = false"
    @added="handlePlaylistAdded"
  />
</template>
```

#### `components/PlayerControls.vue` または `PlayerTrackInfo.vue`

**追加する機能**:

- 現在再生中の楽曲を「プレイリストに追加」ボタン

---

## 🎨 UI/UX 設計

### レイアウト

#### プレイリスト一覧ページ

```
┌─────────────────────────────────────────────────────────┐
│  📱 いぬいのうた                          [ユーザー]    │
├─────────────────────────────────────────────────────────┤
│  🏠 ホーム  │  🎵 楽曲  │  📺 歌枠  │  📋 プレイリスト │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  プレイリスト                           [+ 新規作成]    │
│                                                          │
│  ⚠️ プレイリストはこのブラウザにのみ保存されます        │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ [📸][📸]     │  │ [📸][📸]     │  │ [📸][📸]     │    │
│  │ [📸][📸]     │  │ [📸][📸]     │  │ [📸][📸]     │    │
│  │             │  │             │  │             │    │
│  │ お気に入り   │  │ ドライブ曲   │  │ 作業用BGM    │    │
│  │ 25曲        │  │ 12曲        │  │ 30曲        │    │
│  │ 2025/10/20  │  │ 2025/10/22  │  │ 2025/10/24  │    │
│  │         [⋮] │  │         [⋮] │  │         [⋮] │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### プレイリスト詳細ページ

```
┌─────────────────────────────────────────────────────────┐
│  📱 いぬいのうた                          [ユーザー]    │
├─────────────────────────────────────────────────────────┤
│  [← 戻る]                                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🎵 お気に入りのオリジナル曲            [編集] [削除]  │
│  戌亥とこのオリジナル曲まとめ                           │
│  25曲 • 2025/10/20作成                                  │
│                                                          │
│  [▶️ 全曲再生]                                          │
│                                                          │
│  ────────────────────────────────────────────────       │
│                                                          │
│  [≡] 1. Daydreamer                          [▶️] [×]   │
│       Nornis • Nornis 1st Mini Album                    │
│                                                          │
│  [≡] 2. 君に送る歌                          [▶️] [×]   │
│       戌亥とこ • オリジナル楽曲                         │
│                                                          │
│  ...                                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### プレイリスト作成モーダル

```
┌─────────────────────────────────────────┐
│  プレイリストを作成                [×]  │
├─────────────────────────────────────────┤
│                                          │
│  プレイリスト名 *                        │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  説明                                    │
│  ┌────────────────────────────────────┐ │
│  │                                    │ │
│  │                                    │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                          │
│           [キャンセル]  [作成]          │
│                                          │
└─────────────────────────────────────────┘
```

#### プレイリストに追加モーダル

```
┌─────────────────────────────────────────┐
│  プレイリストに追加                [×]  │
├─────────────────────────────────────────┤
│                                          │
│  「Daydreamer」を追加                    │
│                                          │
│  ○ お気に入りのオリジナル曲 (25曲)      │
│  ○ ドライブ曲 (12曲)                     │
│  ○ 作業用BGM (30曲)                      │
│                                          │
│  ────────────────────                    │
│                                          │
│  + 新しいプレイリストを作成              │
│                                          │
│           [キャンセル]  [追加]          │
│                                          │
└─────────────────────────────────────────┘
```

### カラースキーム

- **プライマリカラー**: 既存のテーマに合わせる
- **警告表示**: オレンジ系（LocalStorage 使用の注意）
- **成功表示**: グリーン系（追加完了などのトースト）
- **危険操作**: レッド系（削除ボタン）

### アイコン

- プレイリスト: 📋 または `ListIcon`
- 追加: ➕ または `PlusCircleIcon`
- 編集: ✏️ または `PencilIcon`
- 削除: 🗑️ または `TrashIcon`
- メニュー: ⋮ または `EllipsisVerticalIcon`
- ドラッグハンドル: ≡ または `Bars3Icon`

---

## 🔔 通知システム

### トースト通知が必要な操作

1. **プレイリスト作成完了**

   - "プレイリスト「{name}」を作成しました"

2. **プレイリスト更新完了**

   - "プレイリストを更新しました"

3. **プレイリスト削除完了**

   - "プレイリストを削除しました"

4. **楽曲追加完了**

   - "「{song_title}」をプレイリストに追加しました"

5. **楽曲削除完了**

   - "楽曲をプレイリストから削除しました"

6. **エラー発生時**
   - "エラーが発生しました: {error_message}"

### 実装

```typescript
// composables/useToast.ts (新規作成)
interface ToastOptions {
  type: "success" | "error" | "warning" | "info";
  duration?: number; // ms
}

export const useToast = () => {
  const showToast = (message: string, options?: ToastOptions) => {
    // 実装...
  };

  return { showToast };
};
```

---

## ⚠️ 制約事項と注意点

### LocalStorage の制限

1. **容量制限**: 約 5MB（ブラウザによって異なる）

   - 1 プレイリストあたり約 100 曲まで推奨
   - 合計 20 プレイリスト程度が上限の目安

2. **データ永続性**:

   - ブラウザのデータクリアで消失
   - プライベートブラウジングでは保存されない
   - 別のブラウザ・デバイスでは共有されない

3. **セキュリティ**:
   - LocalStorage は平文保存
   - 個人情報は保存しない（楽曲 ID のみ）

### ユーザーへの注意表示

以下の場所で注意書きを表示:

1. **プレイリスト一覧ページ（常時表示）**

   ```
   ⚠️ プレイリストはこのブラウザにのみ保存されます
   別のデバイスやブラウザでは表示されません
   ```

2. **初回作成時（モーダル内）**
   ```
   💡 プレイリストはLocalStorageに保存されます
   ブラウザのデータを削除すると失われますのでご注意ください
   ```

---

## 🔄 将来の API 移行計画

### 移行時の対応

1. **インターフェースの統一**

   - `useLocalPlaylist` と将来の `usePlaylist` (API 版) は同じインターフェース
   - コンポーネントコードの変更は最小限

2. **データ移行機能**

   ```typescript
   // composables/usePlaylistMigration.ts
   export const usePlaylistMigration = () => {
     const migrateLocalToApi = async () => {
       const localPlaylists = loadFromLocalStorage();
       for (const playlist of localPlaylists) {
         await apiCreatePlaylist(playlist);
       }
       clearLocalStorage();
     };

     return { migrateLocalToApi };
   };
   ```

3. **移行 UI**
   - 認証機能実装後、移行バナーを表示
   - 「LocalStorage のプレイリストをアカウントに移行」ボタン

---

## 📝 実装順序

### Phase 1: 基礎実装（最優先）

1. ✅ データ型定義（`types/playlist.ts` に追加）
2. ✅ `composables/useLocalPlaylist.ts` 実装
3. ✅ `composables/useToast.ts` 実装（簡易版）
4. ✅ `pages/playlists/index.vue` 実装
5. ✅ `components/PlaylistCard.vue` 実装
6. ✅ `components/PlaylistCreateModal.vue` 実装

### Phase 2: 詳細機能（優先）

7. ✅ `pages/playlists/[id].vue` 実装
8. ✅ `components/AddToPlaylistModal.vue` 実装
9. ✅ `components/SongRow.vue` への追加ボタン実装
10. ✅ プレイリスト編集機能

### Phase 3: 高度な機能（余裕があれば）

11. ⬜ ドラッグ&ドロップでの並び替え
12. ⬜ プレイリストのエクスポート/インポート（JSON）
13. ⬜ プレイリスト検索・フィルター
14. ⬜ プレイリストの複製機能

---

## 🧪 テストケース

### 基本操作

- [ ] プレイリストを作成できる
- [ ] プレイリスト一覧が表示される
- [ ] プレイリスト詳細が表示される
- [ ] プレイリストを編集できる
- [ ] プレイリストを削除できる
- [ ] 楽曲をプレイリストに追加できる
- [ ] プレイリストから楽曲を削除できる
- [ ] プレイリストを全曲再生できる

### エッジケース

- [ ] プレイリスト名が空の場合はエラー表示
- [ ] 同じ楽曲を複数回追加できる（重複 OK）
- [ ] 空のプレイリストを作成できる
- [ ] プレイリストが 0 件の場合の表示
- [ ] LocalStorage が無効な場合のエラーハンドリング
- [ ] LocalStorage が満杯の場合のエラー表示

### パフォーマンス

- [ ] 100 曲入りプレイリストでも快適に動作
- [ ] 20 個のプレイリストでも一覧表示が高速

---

## 📊 成功指標

1. **機能性**: すべての基本 CRUD 操作が動作する
2. **UX**: 直感的で使いやすいインターフェース
3. **パフォーマンス**: 操作のレスポンスが 100ms 以内
4. **保守性**: 将来の API 移行がスムーズに行える
5. **エラーハンドリング**: 適切なエラーメッセージ表示

---

## ❓ 確認が必要な点

以下の点について、ご意見をお聞かせください：

1. **UI デザイン**

   - プレイリストカードのレイアウトは適切ですか？
   - サムネイルのグリッド表示（2x2）で良いですか？

2. **機能仕様**

   - 同じ楽曲を複数回追加できる仕様で良いですか？
   - プレイリストの並び替え（作成日時順、名前順など）は必要ですか？

3. **制限事項**

   - 1 プレイリストあたり 100 曲の制限で十分ですか？
   - 合計 20 プレイリストの上限で問題ないですか？

4. **優先度**

   - Phase 3 の機能（ドラッグ&ドロップなど）は後回しで良いですか？
   - 先に Phase 1, 2 を完成させることに同意いただけますか？

5. **トースト通知**

   - 簡易的なトースト実装（`vue-toastification`等のライブラリ使用）で良いですか？
   - それとも自作しますか？

6. **ナビゲーション**
   - サイドバーの「プレイリスト」リンクは既に存在しますか？
   - 存在する場合、そのままで良いですか？

---

これらの点についてご確認いただき、問題なければ実装を開始します！
