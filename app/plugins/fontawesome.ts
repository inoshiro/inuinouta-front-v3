import { library, config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// CSS の二重読み込みを防ぐ（nuxt.config.ts の css[] で管理する）
config.autoAddCss = false;

// ---- Duotone アイコン登録 ----
// 使用するアイコンをここに追加していく。全量 import は避けバンドルサイズを削減する。
import {
  faHouse,
  faMusicNote,
  faMicrophone,
  faTv,
  faCalendarDays,
  faListMusic,
  faCircleInfo,
  faListTimeline,
  faFilm,
  faShuffle,
  faTriangleExclamation,
  faSparkles,
  faGear,
  faLink,
  faEnvelope,
  faChartBar,
} from "@fortawesome/pro-duotone-svg-icons";

// ---- Brands アイコン登録 ----
import { faYoutube, faXTwitter } from "@fortawesome/free-brands-svg-icons";

library.add(
  // Duotone
  faHouse,
  faMusicNote,
  faMicrophone,
  faTv,
  faCalendarDays,
  faListMusic,
  faCircleInfo,
  faListTimeline,
  faFilm,
  faShuffle,
  faTriangleExclamation,
  faSparkles,
  faGear,
  faLink,
  faEnvelope,
  faChartBar,
  // Brands
  faYoutube,
  faXTwitter,
);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("FontAwesomeIcon", FontAwesomeIcon);
});
