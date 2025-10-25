import { useToast as useVueToastification } from "vue-toastification";

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
  const toast = useVueToastification();

  return {
    /**
     * 成功メッセージを表示
     */
    success: (message: string, options?: ToastOptions) => {
      toast.success(message, options as Parameters<typeof toast.success>[1]);
    },

    /**
     * エラーメッセージを表示
     */
    error: (message: string, options?: ToastOptions) => {
      toast.error(message, options as Parameters<typeof toast.error>[1]);
    },

    /**
     * 警告メッセージを表示
     */
    warning: (message: string, options?: ToastOptions) => {
      toast.warning(message, options as Parameters<typeof toast.warning>[1]);
    },

    /**
     * 情報メッセージを表示
     */
    info: (message: string, options?: ToastOptions) => {
      toast.info(message, options as Parameters<typeof toast.info>[1]);
    },

    /**
     * デフォルトメッセージを表示
     */
    default: (message: string, options?: ToastOptions) => {
      toast(message, options as Parameters<typeof toast>[1]);
    },

    /**
     * すべてのトーストを削除
     */
    clear: () => {
      toast.clear();
    },
  };
};
