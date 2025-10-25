// クライアントサイドのみで動的インポート
let toastModule: any = null;

async function getToastModule() {
  if (toastModule) return toastModule;

  if (process.client) {
    try {
      const module = await import("vue-toastification");
      toastModule = module;
      return module;
    } catch (error) {
      console.error("Failed to load vue-toastification:", error);
      return null;
    }
  }
  return null;
}

/**
 * トースト通知のオプション
 */
interface ToastOptions {
  timeout?: number | false;
  closeOnClick?: boolean;
  pauseOnFocusLoss?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  draggablePercent?: number;
  showCloseButtonOnHover?: boolean;
  hideProgressBar?: boolean;
  closeButton?: boolean | "button";
  icon?: boolean | string;
  rtl?: boolean;
}

/**
 * トースト通知を表示するComposable
 *
 * vue-toastificationのuseToastをラップしたもの
 * サーバーサイドでは何もしないダミー関数を返す
 *
 * 使用例:
 * ```ts
 * const toast = useToast();
 * toast.success('プレイリストを作成しました');
 * toast.error('エラーが発生しました');
 * toast.warning('この曲は既に追加されています');
 * toast.info('情報メッセージ');
 * ```
 */
export const useToast = () => {
  // サーバーサイドでは何もしない
  if (import.meta.server) {
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      default: () => {},
      clear: () => {},
    };
  }

  // クライアントサイドでvue-toastificationのuseToastを動的インポート

  return {
    /**
     * 成功メッセージを表示
     */
    success: async (message: string, options?: ToastOptions) => {
      const module = await getToastModule();
      if (module?.useToast) {
        const toast = module.useToast();
        toast.success(message, options);
      }
    },

    /**
     * エラーメッセージを表示
     */
    error: async (message: string, options?: ToastOptions) => {
      const module = await getToastModule();
      if (module?.useToast) {
        const toast = module.useToast();
        toast.error(message, options);
      }
    },

    /**
     * 警告メッセージを表示
     */
    warning: async (message: string, options?: ToastOptions) => {
      const module = await getToastModule();
      if (module?.useToast) {
        const toast = module.useToast();
        toast.warning(message, options);
      }
    },

    /**
     * 情報メッセージを表示
     */
    info: async (message: string, options?: ToastOptions) => {
      const module = await getToastModule();
      if (module?.useToast) {
        const toast = module.useToast();
        toast.info(message, options);
      }
    },

    /**
     * デフォルトメッセージを表示
     */
    default: async (message: string, options?: ToastOptions) => {
      const module = await getToastModule();
      if (module?.useToast) {
        const toast = module.useToast();
        toast(message, options);
      }
    },

    /**
     * すべてのトーストを削除
     */
    clear: async () => {
      const module = await getToastModule();
      if (module?.useToast) {
        const toast = module.useToast();
        toast.clear();
      }
    },
  };
};
