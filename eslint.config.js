// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

// Type-aware linting is intentionally not configured here. Adding a
// *-type-checked rule requires setting languageOptions.parserOptions.projectService.
module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      semi: ['error', 'always'],
      '@typescript-eslint/no-unused-vars': ['warn', {}],
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Ratchet: these three carry a large pre-existing backlog (member-ordering 150,
      // no-explicit-any 128, no-underscore-dangle 112) and none of it is auto-fixable.
      // They are warnings so the pre-commit hook can block genuinely new errors without
      // rejecting every commit that touches an already-affected file. Run
      // "npm run lint" to see the backlog. Promote each back to "error" once cleared.
      'no-underscore-dangle': ['warn'],
      '@typescript-eslint/member-ordering': ['warn', {}],
      '@typescript-eslint/no-explicit-any': ['warn'],

      // Also a warning, for a different reason: the 9 findings are on public "blur"
      // and "select" outputs across 8 components. Renaming them breaks every
      // consuming app's template bindings, so this needs an API decision, not a
      // drive-by fix. As an error it would block all commits to those components.
      '@angular-eslint/no-output-native': ['warn'],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
  }
);
