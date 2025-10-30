// @ts-check
import withNuxt from '.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      // Vue固有のルール
      'vue/html-self-closing': 'off', // セルフクロージングタグの警告を無効化
      'vue/singleline-html-element-content-newline': 'off', // 単一行要素の改行強制を無効化
      'vue/multiline-html-element-content-newline': 'off', // 複数行要素の改行強制を無効化
      
      // TypeScript関連のルール
      '@typescript-eslint/no-explicit-any': 'off', // any型の警告を無効化
      '@typescript-eslint/no-unused-vars': 'warn', // 未使用変数を警告レベルに
    }
  }
)
