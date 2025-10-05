<script setup lang="ts">
  defineProps<{
    isOpen: boolean;
  }>();

  const emit = defineEmits<{
    close: [];
  }>();

  const closeModal = () => {
    emit("close");
  };
</script>

<template>
  <Transition
    enter-active-class="transition-opacity ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div
        class="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <!-- ヘッダー -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-700"
        >
          <h2 class="text-xl font-bold text-white">サイト情報</h2>
          <button
            @click="closeModal"
            class="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            aria-label="閉じる"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- コンテンツ -->
        <div class="px-6 py-6 text-gray-200 space-y-6">
          <!-- サイト概要 -->
          <section>
            <h3
              class="text-lg font-semibold text-white mb-3 flex items-center gap-2"
            >
              <span>🎵</span>
              <span>いぬいのうたについて</span>
            </h3>
            <div class="text-sm leading-relaxed space-y-3">
              <p>
                「いぬいのうた」は、VTuber・戌亥とこさんの歌動画を検索・視聴できるファンサイトです。
                楽曲や歌枠配信の検索、プレイリストの作成（準備中）など、様々な機能をお楽しみいただけます。
              </p>
              <p>
                動画再生にはYouTube公式の埋め込みプレイヤーを使用しているため、再生数などは元動画に正しく反映されます。
              </p>
              <p class="text-gray-400">
                当サイトは、いのしろ（<a
                  href="https://x.com/ino463"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-400 hover:text-blue-300 transition-colors"
                  >@ino463</a
                >）個人が開発・運営しています。登録されている動画や曲情報には漏れがある可能性がありますので、予めご了承ください。
              </p>
            </div>
          </section>

          <!-- 主な機能 -->
          <section>
            <h3
              class="text-lg font-semibold text-white mb-3 flex items-center gap-2"
            >
              <span>✨</span>
              <span>主な機能</span>
            </h3>
            <ul class="text-sm space-y-2 list-disc list-inside">
              <li>楽曲・歌枠配信の検索と視聴</li>
              <li>連続再生機能</li>
            </ul>
          </section>

          <!-- 技術スタック -->
          <section>
            <h3
              class="text-lg font-semibold text-white mb-3 flex items-center gap-2"
            >
              <span>⚙️</span>
              <span>技術スタック</span>
            </h3>
            <div class="text-sm space-y-2">
              <div>
                <span class="text-gray-400">フロントエンド:</span>
                <span class="ml-2"
                  >Nuxt 3, Vue 3, TypeScript, Tailwind CSS</span
                >
              </div>
              <div>
                <span class="text-gray-400">バックエンド:</span>
                <span class="ml-2">Django, Python</span>
              </div>
            </div>
          </section>

          <!-- リンク -->
          <section>
            <h3
              class="text-lg font-semibold text-white mb-3 flex items-center gap-2"
            >
              <span>🔗</span>
              <span>関連リンク</span>
            </h3>
            <div class="space-y-2 text-sm">
              <a
                href="https://www.youtube.com/@InuiToko"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>📺</span>
                <span>戌亥とこ YouTubeチャンネル</span>
              </a>
              <a
                href="https://twitter.com/inui_toko"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>🐦</span>
                <span>戌亥とこ Twitter</span>
              </a>
            </div>
          </section>

          <!-- 連絡先 -->
          <section>
            <h3
              class="text-lg font-semibold text-white mb-3 flex items-center gap-2"
            >
              <span>📧</span>
              <span>連絡先</span>
            </h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-gray-400">Twitter:</span>
                <a
                  href="https://x.com/inui_no_uta"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  @inui_no_uta
                </a>
              </div>
              <div>
                <span class="text-gray-400">マシュマロ:</span>
                <a
                  href="https://marshmallow-qa.com/inui_no_uta"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  marshmallow-qa.com/inui_no_uta
                </a>
              </div>
              <div>
                <span class="text-gray-400">Wavebox:</span>
                <a
                  href="https://wavebox.me/wave/4v3755rdt2e2otd5/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  wavebox.me/wave/4v3755rdt2e2otd5
                </a>
              </div>
            </div>
          </section>

          <!-- フッター情報 -->
          <section class="pt-4 border-t border-gray-700">
            <p class="text-xs text-gray-400">
              ※ このサイトは非公式のファンサイトです。<br />
              ※ 動画コンテンツの著作権は各権利者に帰属します。
            </p>
          </section>
        </div>
      </div>
    </div>
  </Transition>
</template>
