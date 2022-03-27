import { buildSync } from 'esbuild'
buildSync({
  entryPoints: ['packages/server/src/main.ts', 'packages/server/src/preload.ts', 'packages/client/src/main.ts', 'packages/client/src/preload.ts'],
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  minify: true,
  sourcemap: true,
  target: ['node16'],
  loader: {
    '.png': 'file',
    '.ts': 'ts',
  },
  outExtension: {
    'packages/server/src/main.js': 'dist/server.min.js',
    'packages/server/src/preload.js': 'dist/server.preload.min.js',
    'packages/client/src/main.js': 'dist/client.min.js',
    'packages/client/src/preload.js': 'dist/client.preload.min.js',
  },
  logLevel: 'info',
  chunkNames: 'chunks/[name]-[hash]',
  assetNames: 'assets/[name]-[hash]',
  color: true,
  define: {
    'process.env.NODE_ENV': "'production'",
  },
  banner: {
    js: '/* Copyright© 2022 7086cmd */',
  },
  treeShaking: true,
  external: ['electron'],
  metafile: true,
})
