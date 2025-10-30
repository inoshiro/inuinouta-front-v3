// YouTube IFrame Player API の初期化
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default defineNuxtPlugin(async () => {
  // クライアントサイドでのみ実行
  if (process.client) {
    return new Promise((resolve) => {
      // YouTube API がすでに読み込まれている場合
      if (window.YT && window.YT.Player) {
        resolve({});
        return;
      }

      // YouTube API の読み込み
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";

      window.onYouTubeIframeAPIReady = () => {
        resolve({});
      };

      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    });
  }
});
