/**
 * プレイヤー音量設定の初期化プラグイン
 * クライアントサイドでのみ実行され、localStorage から保存された音量設定を読み込みます
 */
export default defineNuxtPlugin(() => {
  const playerStore = usePlayerStore();
  
  // ストアの音量設定を初期化
  playerStore.initializeVolumeSettings();
});
