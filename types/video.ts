export type Video = {
  id: string;
  title: string;
  url: string;
  thumbnail_path: string;
  is_open: boolean;
  is_member_only: boolean;
  is_stream: boolean;
  unplayable: boolean;
  published_at: string;
};
