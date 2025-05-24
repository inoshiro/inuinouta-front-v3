import type { Channel } from "./channel";

export type Video = {
  id: string;
  channel: Channel;
  title: string;
  url: string;
  is_open: boolean;
  is_member_only: boolean;
  is_stream: boolean;
  published_at: string;
};
