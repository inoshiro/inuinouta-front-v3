/**
 * プレイヤー永続化プラグイン
 * クライアントサイドでのみ実行され、localStorage から保存された
 * プレイヤー設定（音量、リピート、シャッフル、現在の楽曲、キュー）を読み込みます
 */
export default defineNuxtPlugin(() => {
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // シンプルに500ms遅延してロード
  setTimeout(() => {
    // プレイヤーの設定を初期化（音量、リピート、シャッフル、現在の楽曲）
    playerStore.initializeVolumeSettings();
    playerStore.initializePlayerSettings();

    // キューの設定を初期化（曲リスト、再生位置）
    queueStore.initializeQueueSettings();

    console.log("プレイヤー状態復元完了 (遅延ロード):", {
      queueLength: queueStore.queue.length,
      nowPlayingIndex: queueStore.nowPlayingIndex,
      currentTrack: queueStore.nowPlaying?.title || "なし",
    });
  }, 500);
});
