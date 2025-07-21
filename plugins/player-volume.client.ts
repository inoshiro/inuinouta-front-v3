/**
 * プレイヤー設定の初期化プラグイン
 * クライアントサイドでのみ実行され、localStorage から保存された設定を読み込みます
 */
export default defineNuxtPlugin(() => {
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // プレイヤーの設定を初期化（音量、リピート、シャッフル、現在の楽曲）
  playerStore.initializeVolumeSettings();
  playerStore.initializePlayerSettings();

  // キューの設定を初期化（曲リスト、再生位置）
  queueStore.initializeQueueSettings();
});
