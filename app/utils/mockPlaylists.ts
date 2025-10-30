import type { LocalPlaylist } from "~/types/playlist";
import type { Song } from "~/types/song";

// ダミーの楽曲データ
export const mockSongs: Song[] = [
  {
    id: 659,
    video: {
      id: "SgdIulgNKa4",
      title:
        "【重大告知あり】Nornis 1st Mini Album『Tensegrity』リリース決定記念トーク&ミニライブ",
      url: "https://www.youtube.com/watch?v=SgdIulgNKa4",
      thumbnail_path:
        "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/SgdIulgNKa4.jpg",
      is_open: true,
      is_member_only: false,
      is_stream: true,
      unplayable: false,
      published_at: "2024-04-23T21:08:31+09:00",
    },
    title: "Daydreamer",
    artist: "Nornis",
    is_original: true,
    start_at: 60,
    end_at: 293,
  },
  {
    id: 1,
    video: {
      id: "zokUrGt0iuc",
      title: "【歌ってみた】一度だけの恋なら【とこりぜるる】",
      url: "https://www.youtube.com/watch?v=zokUrGt0iuc",
      thumbnail_path:
        "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/zokUrGt0iuc.jpg",
      is_open: true,
      is_member_only: false,
      is_stream: false,
      unplayable: false,
      published_at: "2020-05-04T05:00:00+09:00",
    },
    title: "一度だけの恋なら",
    artist: "ワルキューレ",
    is_original: false,
    start_at: 0,
    end_at: 253,
  },
  {
    id: 406,
    video: {
      id: "VV_MJFmNWo0",
      title:
        "【告知と歌！】ソロライブの円盤が発売されるぞ～～～～！！【戌亥とこ/にじさんじ】",
      url: "https://www.youtube.com/watch?v=VV_MJFmNWo0",
      thumbnail_path:
        "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/VV_MJFmNWo0.jpg",
      is_open: true,
      is_member_only: false,
      is_stream: true,
      unplayable: false,
      published_at: "2021-07-15T18:59:07+09:00",
    },
    title: "優しい彗星",
    artist: "YOASOBI",
    is_original: false,
    start_at: 2789,
    end_at: 3008,
  },
  {
    id: 100,
    video: {
      id: "abc123",
      title: "【歌枠】楽しい歌枠配信",
      url: "https://www.youtube.com/watch?v=abc123",
      thumbnail_path:
        "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/abc123.jpg",
      is_open: true,
      is_member_only: false,
      is_stream: true,
      unplayable: false,
      published_at: "2024-01-15T20:00:00+09:00",
    },
    title: "君に送る歌",
    artist: "戌亥とこ",
    is_original: true,
    start_at: 1000,
    end_at: 1240,
  },
];

// ダミーのプレイリストデータ
export const mockPlaylists: LocalPlaylist[] = [
  {
    id: "playlist-1",
    name: "お気に入りのオリジナル曲",
    description: "戌亥とこのオリジナル曲まとめ",
    created_at: "2025-10-20T10:00:00+09:00",
    updated_at: "2025-10-25T11:30:00+09:00",
    items: [
      {
        id: "item-1",
        song_id: 659,
        order: 0,
        added_at: "2025-10-20T10:05:00+09:00",
      },
      {
        id: "item-2",
        song_id: 100,
        order: 1,
        added_at: "2025-10-21T15:20:00+09:00",
      },
    ],
  },
  {
    id: "playlist-2",
    name: "ドライブ曲",
    description: "運転中に聴きたい爽やかな曲",
    created_at: "2025-10-22T14:00:00+09:00",
    updated_at: "2025-10-23T09:15:00+09:00",
    items: [
      {
        id: "item-3",
        song_id: 1,
        order: 0,
        added_at: "2025-10-22T14:10:00+09:00",
      },
      {
        id: "item-4",
        song_id: 406,
        order: 1,
        added_at: "2025-10-22T14:15:00+09:00",
      },
      {
        id: "item-5",
        song_id: 659,
        order: 2,
        added_at: "2025-10-23T09:15:00+09:00",
      },
    ],
  },
  {
    id: "playlist-3",
    name: "作業用BGM",
    description: "集中したいときに聴く曲",
    created_at: "2025-10-24T08:00:00+09:00",
    updated_at: "2025-10-24T08:00:00+09:00",
    items: [
      {
        id: "item-6",
        song_id: 406,
        order: 0,
        added_at: "2025-10-24T08:05:00+09:00",
      },
    ],
  },
];

// プレイリストIDから楽曲データを取得するヘルパー関数
export const getPlaylistSongs = (playlist: LocalPlaylist): Song[] => {
  return playlist.items
    .sort((a, b) => a.order - b.order)
    .map((item) => mockSongs.find((song) => song.id === item.song_id))
    .filter((song): song is Song => song !== undefined);
};
