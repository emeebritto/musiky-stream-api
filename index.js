#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yas = require('./src/index');
const args = require('minimist')(process.argv.slice(2));
const { bold, blue, white, red, gray } = require('chalk');
const port = args.p || args.port || process.env.PORT || 9870;
// fsdf
var artFile = path.join(__dirname, './src/ascii-art.txt');
var art = fs.readFileSync(artFile, 'utf8');
console.log(art);

function download ({ id, file, h, help }) {
  // Display usage.
  if (help || h) {
    console.info(yas.downloader.help());
    process.exit();
  }

  // Nothing to download.
  if (!file && !id) return false;

  // Validations.
  console.log('-'.repeat(80));
  if (!id) {;
    console.error(red('Missing param:'), gray('--id [youtube-video-id]'));
    process.exit();
  }

  file = file || `./youtube-audio.mp3`;
  console.log(`${bold(white('DOWNLOAD:'))} ${blue(id)}`);
  yas.downloader
    .onSuccess(() => process.exit())
    .onError(error => {
      console.error(error)
      process.exit()
    })
    .download(args)

  return true;
}

function run () {
  if (download(args)) return;

  yas.listen(port, () => {
    console.log(' 🔈  Listening on ', blue(`http://localhost:${port}`));
    console.log('-'.repeat(80));
  });
}

run();
