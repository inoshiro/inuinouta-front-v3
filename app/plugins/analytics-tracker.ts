/**
 * Google Analytics自動追跡プラグイン
 *
 * 再生中の曲が変わるタイミングを自動的に検知して
 * play_songイベントを送信します
 */
export default defineNuxtPlugin((nuxtApp) => {
  const queue = usePlayerQueue();
  const player = usePlayerStore();
  const analytics = useAnalytics();

  // 前回追跡した曲のIDを記録（重複送信防止）
  let lastTrackedSongId: number | null = null;

  // 再生中の曲が変わったときに自動追跡
  watch(
    () => queue.nowPlaying,
    (newSong, oldSong) => {
      // ページロード時の初期化（null -> song）はスキップ
      // 実際に曲が切り替わったとき（song -> another song）のみ追跡
      if (!oldSong) {
        return;
      }

      // 同じ曲への遷移はスキップ（プレイヤー復元時など）
      if (newSong && oldSong && newSong.id === oldSong.id) {
        return;
      }

      // 曲が存在し、前回と異なる場合のみ追跡
      if (newSong && newSong.id !== lastTrackedSongId) {
        analytics.trackSongPlay(newSong);
        lastTrackedSongId = newSong.id;
      } else if (!newSong) {
        // 曲がなくなった場合はリセット
        lastTrackedSongId = null;
      }
    }
  );

  // 再生開始時の追跡（初回ロードされた曲の再生開始をキャッチ）
  watch(
    () => player.playerState,
    (newState, oldState) => {
      // 再生が開始された瞬間を検知（PLAYING状態になった）
      if (newState === "PLAYING" && oldState !== "PLAYING") {
        const currentSong = queue.nowPlaying;

        // 曲が存在し、まだ追跡していない場合のみ送信
        if (currentSong && lastTrackedSongId !== currentSong.id) {
          analytics.trackSongPlay(currentSong);
          lastTrackedSongId = currentSong.id;
        }
      }
    }
  );
});
