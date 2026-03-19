import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';
import htmllint from 'eslint-plugin-html';

export default defineConfig([
    eslintConfigPrettier,
    pluginReact.configs.flat.recommended,
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
    { files: ['**/*.ts'], languageOptions: { sourceType: 'module' } },
    {
        files: ['**/*.{js,mjs,cjs,jsx}'],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        plugins: { js },
        extends: ['js/recommended'],
    },
    {
        files: ['**/*.{ts,tsx}'],
        plugins: { ts },
        extends: ['ts/recommended'],
    },
    {
        files: ['**/*.json'],
        plugins: { json },
        language: 'json/json',
        extends: ['json/recommended'],
    },
    {
        files: ['**/*.md'],
        plugins: { markdown },
        language: 'markdown/gfm',
        extends: ['markdown/recommended'],
    },
    {
        files: ['**/*.css'],
        plugins: { css },
        language: 'css/css',
        extends: ['css/recommended'],
    },
    {
        ...html.configs['flat/recommended'],
        files: ['**/*.html'],
        rules: {
            ...html.configs['flat/recommended'].rules, // Must be defined. If not, all recommended rules will be lost
            '@html-eslint/indent': 'error',
        },
        plugins: {
            '@html-eslint': html,
            htmllint,
        },
        languageOptions: {
            parser: htmlParser,
        },
    },
]);
