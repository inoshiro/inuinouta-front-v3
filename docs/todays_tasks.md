## ✅ 本日の ToDo リスト

### 🐍 Django 開発環境セットアップ

- [x] 仮想環境作成（必要に応じて `python -m venv venv`）
- [x] `pip install -r requirements.txt` or `requirements_dev.txt`

  - ※ `PyYAML`, `six`, `cython`, `wheel` 周辺に注意

- [x] `local_settings.py` 設置 & 設定

  - `SECRET_KEY`, `DEBUG`, `AWS_*` 系環境変数の読込

- [ ] `boto3` & `S3連携の動作確認`

  - `manage.py runserver` で起動確認
  - サムネイル画像のアップロード処理にエラーが出ないことを確認

---

### 🧱 プレイリスト API 実装タスク

- [x] モデル確認 or 実装（`Playlist`, `PlaylistItem`）

  - ManyToMany + 中間テーブルで順序保持

- [x] シリアライザ作成（`PlaylistSerializer`, `PlaylistItemSerializer`）
- [x] ViewSet 実装（`PlaylistViewSet`）
- [x] ルーティング登録（`urls.py`）
- [x] API レスポンスの構造確認

  - Nuxt 側の `usePlaylist` composable との整合性

---

### 🧪 開発後の動作確認・メンテ

- [x] `http://localhost:8000/api/playlists/` が期待通り動作するか確認
- [x] Nuxt3 側からの `usePlaylist()` fetch テスト
- [x] API のテスト or `curl`, `httpie` 等で最低限の確認
- [x] 実装ログ・設計意図の追記（`docs/implementation-log.md`）

---

### 🎤 歌動画一覧プロトタイプ実装

- [ ] API 仕様確認・型定義作成（`types/video.ts`）
- [ ] `useVideos` composable 実装
- [ ] 動画一覧ページ作成（`pages/videos.vue`）
- [ ] サムネイル・タイトル・再生ボタンの UI 作成
- [ ] API 連携・データ取得の動作確認

---

### 🗓️ 歌枠一覧プロトタイプ実装

- [ ] API 仕様確認・型定義作成（`types/song.ts` or `types/karaoke.ts`）
- [ ] `useSongs` composable 実装
- [ ] 歌枠一覧ページ作成（`pages/songs.vue` など）
- [ ] 歌枠タイトル・日付・参加者表示の UI 作成
- [ ] API 連携・データ取得の動作確認

---

## 🟡 任意・余裕があればやること

- [ ] S3 のサムネイルアップロード処理を開発用モック化（負荷軽減）
- [ ] `.env`ベースの環境変数管理（`python-decouple` 導入検討）
- [ ] `PlayerQueuePanel` のスマホ表示制御（Tailwind で `lg:hidden` など）

---

### 💬 ワンポイントアドバイス

- Django の`runserver`起動に失敗したら、まず `local_settings.py` のパス・値・環境変数を確認。
- フロント連携を意識して、API レスポンスの構造はあらかじめ型定義（`types/playlist.ts`）と照らし合わせると後が楽です。
