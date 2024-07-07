// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from "eslint-plugin-react/configs/recommended";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    ...eslintPluginPrettierRecommended
  },
  {
    files:['**/*.{ts,tsx}'],
    ...reactRecommended,
    languageOptions: {
      ...reactRecommended.languageOptions,
    }
  },
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        ecmaVersion: 2018,
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigDirName: import.meta.dirname,
      }
    },
    rules: {

    }
  },
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx']
  }
);