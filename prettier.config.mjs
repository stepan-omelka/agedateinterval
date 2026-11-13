/**
 * @see https://prettier.io/docs/options
 * @see https://github.com/trivago/prettier-plugin-sort-imports
 * @type {import("prettier").Config & import("@trivago/prettier-plugin-sort-imports").PluginConfig}
 */
export default {
  printWidth: 100,
  singleQuote: true,
  arrowParens: 'avoid',
  trailingComma: 'all',
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['<THIRD_PARTY_MODULES>', '<BUILTIN_MODULES>', '^@shared/(.*)$', '^[./]'],
  importOrderSortSpecifiers: true,
  importOrderSideEffects: false,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  overrides: [{ files: '*.html', options: { parser: 'angular' } }],
};
