import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  server: {
    port: 8080,
    proxy: [
      {
        pathFilter: '/api',
        target: 'http://localhost:3000',
      },
    ],
  },
  plugins: [
    pluginReact(),
    pluginSass(),
    pluginSvgr(),
    pluginBabel({
      include: /\.[jt]sx?$/,
      exclude: [/[\\/]node_modules[\\/]/],
      babelLoaderOptions(opts) {
        opts.plugins?.unshift('babel-plugin-react-compiler');
      },
    }),
  ],
  html: {
    template: './public/index.html',
  },
});
