import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';

export default [
 { ignores: ['node_modules/**', 'dist/**', '.wrangler/**', '.next*/**', '.vinext/**', 'data/**', 'drizzle/**', 'deploy/**', 'cloudflare-env.d.ts', 'src/routeTree.gen.ts'] },
 ...tseslint.configs.recommended,
 {
  files: ['**/*.ts', '**/*.tsx'],
  plugins: { 'react-hooks': hooks },
  rules: {
   '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
   '@typescript-eslint/no-explicit-any': 'warn',
   'react-hooks/rules-of-hooks': 'error',
   'react-hooks/exhaustive-deps': 'warn',
  },
 },
 {
  files: ['src/routes/**/*.tsx'],
  rules: { 'no-restricted-syntax': ['error', { selector: 'JSXElement > JSXOpeningElement[name.name=/^[a-z]/]', message: 'Keep route modules thin: render the screen from src/components.' }] },
 },
];
