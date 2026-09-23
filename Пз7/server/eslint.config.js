// Плаский конфіг ESLint 9+. Мета не «менше попереджень», а менше
// суперечок про стиль: правило одне для всіх, і його перевіряє пайплайн.
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist/**', 'src/generated/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // Змінна, яку завели і не використали, — майже завжди слід
      // недописаної думки. Префікс _ каже «так і задумано».
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // any вимикає перевірку типів рівно там, де вона найпотрібніша.
      '@typescript-eslint/no-explicit-any': 'warn',
      // console.log, забутий у коді, — найчастіший «сміттєвий» коміт.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Скрипти CLI — seed і подібні — саме для того й існують, щоб друкувати
    // у консоль. Правило вимикаємо точково, а не глобально.
    files: ['prisma/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
)
