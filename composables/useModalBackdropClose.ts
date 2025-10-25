/**
 * モーダルの背景クリックで閉じる処理を管理するcomposable
 * マウスダウンとマウスアップの両方が背景で発生した場合のみ閉じる
 */
export const useModalBackdropClose = (onClose: () => void) => {
  const isMouseDownOnBackdrop = ref(false);

  /**
   * 背景でマウスダウンされた際の処理
   */
  const handleMouseDown = (event: MouseEvent) => {
    // イベントのターゲットが背景要素自身の場合のみフラグを立てる
    if (event.target === event.currentTarget) {
      isMouseDownOnBackdrop.value = true;
    }
  };

  /**
   * 背景でマウスアップされた際の処理
   */
  const handleMouseUp = (event: MouseEvent) => {
    // マウスダウンも背景で行われており、マウスアップも背景で行われた場合のみ閉じる
    if (isMouseDownOnBackdrop.value && event.target === event.currentTarget) {
      onClose();
    }
    // フラグをリセット
    isMouseDownOnBackdrop.value = false;
  };

  /**
   * マウスが要素から離れた際の処理（クリーンアップ）
   */
  const handleMouseLeave = () => {
    isMouseDownOnBackdrop.value = false;
  };

  return {
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
  };
};
