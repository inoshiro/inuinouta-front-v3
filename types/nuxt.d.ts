// Toast type definitions for vue-toastification
interface ToastInterface {
  success(message: string, options?: any): void;
  error(message: string, options?: any): void;
  warning(message: string, options?: any): void;
  info(message: string, options?: any): void;
  (message: string, options?: any): void;
  clear(): void;
}

declare module "vue" {
  interface ComponentCustomProperties {
    $toast: ToastInterface;
  }
}

export {};
