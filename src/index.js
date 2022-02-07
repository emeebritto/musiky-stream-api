const path = require('path')
const fs = require('fs')
const express = require('express')
const nofavicon = require('express-no-favicons')
const { yellow, green, gray, blue } = require('chalk')
const youtube = require('./youtube')
const downloader = require('./downloader')
const whileExistFile = require('./wait');
const app = express()

function listen (port, callback = () => {}) {
  app.use(nofavicon())

  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    next();
  })

  app.get('/', (req, res) => {
    res.json({
        title: 'Musiky-Stream-API',
        description: "Musiky Project"
    });
  })

  app.get('/chunk/:videoId', async(req, res) => {
    const videoId = req.params.videoId

    try {
      log(`Sending chunk ${blue(videoId)}`);
      const filePath = path.join(__dirname, `../${videoId}.mp3`);
      if (fs.existsSync(filePath)) {
        res.send(fs.readFileSync(filePath));
      } else {
        youtube.download({ id: videoId }, async(err, { id, file }) => {
          if (err) return res.sendStatus(500, err);
          res.send(await fs.readFileSync(file));
          //fs.unlinkSync(file);
        })
      }
    } catch (e) {
      log(e)
      res.sendStatus(500, e)
    }
  })

  app.get('/:videoId', (req, res) => {
    const videoId = req.params.videoId
    const videoMode = parseInt(req.query.videoMode);

    try {
      log(`Streaming ${yellow(videoId)}`)
      if (videoMode) youtube.videoStream(videoId).pipe(res)
      if (!videoMode) youtube.stream(videoId).pipe(res)
    } catch (e) {
      log(e)
      res.sendStatus(500, e)
    }
  })
/*
  app.get('/cache/:videoId', (req, res) => {
    const videoId = req.params.videoId

    try {
      log(`Streaming cached ${green(videoId)}`)
      youtube.stream(videoId, true).pipe(res)
    } catch (e) {
      log(e)
      res.sendStatus(500, e)
    }
  })

  app.get('/search/:query/:page?', (req, res) => {
    const { query, page } = req.params
    const pageStr = page ? gray(` #${page}`) : ''
    log(`Searching ${yellow(query)}`, pageStr)
    youtube.search({ query, page }, (err, data) => {
      if (err) {
        log(err)
        res.sendStatus(500, err)
        return
      }

      res.json(data)
    })
  })

  app.get('/get/:id', (req, res) => {
    const id = req.params.id

    youtube.get(id, (err, data) => {
      if (err) {
        log(err)
        res.sendStatus(500, err)
        return
      }

      res.json(data)
    })
  })
*/

  app.use((req, res) => {
    res.sendStatus(404)
  })

  app.listen(port, callback)
}

function log () {
  const now = new Date()
  console.log(gray(now.toISOString()), ...arguments)
}

module.exports = {
  listen,
  downloader,
  get: (id, callback) => youtube.get(id, callback),
  search: ({ query, page }, callback) =>
    youtube.search({ query, page }, callback),
  setKey: key => youtube.setKey(key)
}
