/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { build } from 'esbuild'
import chalk from 'chalk'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import glob from 'glob'
import { exec } from 'child_process'
import { createServer } from 'vite'
import { platform } from 'os'

const getGlob = () => [...glob.sync('packages/**/*.*')]

const __dirname = resolve()
const packageFile = JSON.parse(readFileSync(resolve(__dirname, './package.json')).toString())
packageFile.main = 'dist/main.js'
writeFileSync(resolve(__dirname, './package.json'), JSON.stringify(packageFile, null, 2))

platform === 'win32' && exec('taskkill /f /im electron.exe')

const generate = async () => {
  build({
    entryPoints: ['packages/server/src/main.ts', 'packages/server/src/preload.ts', 'packages/client/src/main.ts', 'packages/client/src/preload.ts'],
    outdir: 'dist',
    platform: 'node',
    format: 'cjs',
    metafile: true,
    loader: {
      '.ts': 'ts',
      '.png': 'file',
    },
    target: ['node16'],
    logLevel: 'info',
    chunkNames: 'chunks/[name]-[hash]',
    assetNames: 'assets/[name]',
    color: true,
    define: {
      'process.env.NODE_ENV': "'development'",
    },
    mainFields: ['main', 'module'],
    banner: {
      js: '/* Copyright© 2022 7086cmd. */',
    },
    watch: true,
    bundle: true,
    sourcemap: true,
    external: ['electron'],
  })
  console.log(chalk.green(`[Build] ${getGlob().length} files have built.`))
}
createServer()
  .then(result => {
    return result.listen()
  })
  .then(result => {
    console.log(chalk.green('Front End Server Started.'))
    console.log(chalk.blue('[Vite] ----- DEV --- SERVER --- URL -----'))
    result.printUrls()
    console.log(chalk.blue('[Vite] ----------------------------------'))
  })

generate()
