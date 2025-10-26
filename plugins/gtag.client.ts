/**
 * Google Analytics 4 (GA4) プラグイン
 * クライアントサイドのみで動作します
 */

// Window型の拡張
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const router = useRouter();

  // GA4 測定IDが設定されていない場合は何もしない
  if (!config.public.gaId) {
    console.warn("GA4 測定IDが設定されていません");
    return;
  }

  // Google Analytics スクリプトを読み込み
  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${config.public.gaId}`,
        async: true,
      },
    ],
  });

  // gtag を初期化
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", config.public.gaId, {
    send_page_view: false, // 手動でページビューを送信するため無効化
  });

  // ルート変更時に自動的にページビューを送信
  router.afterEach((to) => {
    gtag("event", "page_view", {
      page_path: to.fullPath,
      page_title: document.title,
      page_location: window.location.href,
    });
  });

  // gtagをグローバルに提供
  return {
    provide: {
      gtag,
    },
  };
});
