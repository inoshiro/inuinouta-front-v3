# このプロジェクトで開発に着手するために必要な知識まとめ

## 1. Web の基礎知識

- HTML・CSS・JavaScript の基本的な構造と役割
- Web ブラウザでの表示の仕組み

## 2. Vue.js の基礎

- Vue コンポーネントの作り方（`.vue`ファイルの構造：template/script/style）
- データバインディング（`v-bind`、`v-model`など）
- イベントハンドリング（`@click`など）
- Props と Emit（親子コンポーネント間のデータ受け渡し）

## 3. Nuxt 3 の基礎

- Nuxt の役割（Vue のフレームワークで、ページルーティングやレイアウト管理が簡単になる）
- ディレクトリ構成の意味（`pages/`, `layouts/`, `components/` など）
- ページ自動ルーティング（`pages/index.vue`がトップページになる等）
- レイアウト（`layouts/default.vue` で全体の共通枠を作る）

## 4. Tailwind CSS の基礎

- ユーティリティクラスの使い方（`bg-gray-700`や`flex`など）
- クラスの組み合わせでデザインを作る考え方
- カスタム設定（`tailwind.config.js`の役割）

## 5. 開発環境・ツール

- パッケージマネージャ（pnpm/yarn/npm）の使い方
- 開発サーバーの起動・ビルド方法（`pnpm run dev` など）
- VS Code などのエディタの基本操作

## 6. プロジェクト固有の構成理解

- `components/layout/`：ヘッダー・フッター・サイドバーなど共通パーツ
- `layouts/default.vue`：全ページ共通のレイアウト
- `pages/`：各ページの実装
- `assets/css/main.css`：Tailwind のエントリーポイント
- `tailwind.config.js`：Tailwind の設定ファイル

## 7. Git の基礎（推奨）

- 変更履歴の管理、ブランチの使い方、コミット・プッシュの方法

---

### まとめ

- **Vue/Nuxt のコンポーネント構造とページルーティング**
- **Tailwind CSS のユーティリティクラス**
- **開発サーバーの起動方法**
- **プロジェクトのディレクトリ構成の意味**

これらを押さえれば、フロントエンド初心者でもこのプロジェクトの開発に着手しやすくなります。
