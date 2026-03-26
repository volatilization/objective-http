import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default defineConfig([
    eslintConfigPrettier,
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: { globals: globals.node },
        plugins: { js },
        extends: ['js/recommended'],
    },
    {
        files: ['**/*.json'],
        plugins: { json },
        language: 'json/json',
        extends: ['json/recommended'],
    },
    {
        files: ['package-lock.json'],
        rules: {
            'json/no-empty-keys': 'off',
        },
    },
    {
        files: ['**/*.md'],
        plugins: { markdown },
        language: 'markdown/gfm',
        extends: ['markdown/recommended'],
    },
]);
