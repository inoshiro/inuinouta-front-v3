// YouTube IFrame API プラグイン (クライアントサイドのみ)
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default defineNuxtPlugin(() => {
  // クライアントサイドでのみ実行
  if (process.client) {
    // YouTube APIが既に読み込まれている場合は何もしない
    if (window.YT && window.YT.Player) {
      return;
    }

    // 既存のスクリプトタグをチェック
    const existingScript = document.querySelector(
      'script[src*="youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      // スクリプトタグを作成して読み込み
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  }
});
