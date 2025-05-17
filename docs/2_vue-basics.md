# Vue.js の基礎ガイド

## .vue ファイルの構造

- `template`：HTML 部分。UI の見た目を記述。
- `script`：JavaScript/TypeScript 部分。ロジックやデータを記述。
- `style`：CSS 部分。コンポーネント固有のスタイルを記述。

## データバインディング

- `{{ message }}` でデータを表示。
- `v-bind:属性="値"` または `:属性="値"` で属性にデータをバインド。
- `v-model` でフォーム要素とデータを双方向バインド。

## イベントハンドリング

- `@click="メソッド名"` でクリックイベントを処理。
- 他にも `@input` や `@change` など。

## Props と Emit

- 親 → 子：`props`で値を受け取る。
- 子 → 親：`emit`でイベントを発火し、親が受け取る。

## 参考リンク

- [Vue.js 公式ガイド](https://ja.vuejs.org/guide/introduction.html)
