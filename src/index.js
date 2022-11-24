const path = require('path');
const fs = require('fs');
const nofavicon = require('express-no-favicons');
const { yellow, green, gray, blue } = require('chalk');
const youtube = require('./youtube');
const pinterest = require('./pinterest')
const downloader = require('./downloader');
const cache = require("memory-cache");
const whileExistFile = require('./wait');
const { httpsServer, io, app } = require('../app');
const cors = require('cors');

function listen (port, callback = () => {}) {
  app.use(nofavicon());
  app.use(cors({ origin: "*" }));

  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    req.io = io;
    next();
  })

  app.get('/', (req, res) => {
    res.json({
        title: 'Musiky-Stream-API',
        description: "Musiky Project"
    });
  })

  app.get('/chunk/:videoId', async(req, res) => {
    return res.json({ msg: "this route is available, use '/[id]' instead" })
    const videoId = req.params.videoId;

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
    return res.json({ msg: "this route is available (reason: internal limit)" })
    const videoId = req.params.videoId;
    const videoMode = parseInt(req.query.videoMode);
    const source = req.query.source;
    const format = req.query.format;
    try {
      if (source === 'pr') {
        log(`Streaming ${yellow(videoId)}`)
        videoMode
          ? pinterest.videoStream({id: videoId, output: res})
          : res.status(404).send()
        return;
      }
      if (source === 'yt') {
        if (!videoMode && format === 'mp3') {
          youtube.stream(videoId).pipe(res)
          return;
        }
        log(`Streaming ${yellow(videoId)}`)
        videoMode
          ? youtube.videoStream(videoId).pipe(res)
          : youtube.audioStream(videoId).pipe(res)
        return;
      }
    } catch (e) {
      log(e)
      res.sendStatus(500, e)
    }
  })

  app.get('/:videoId/streams', async(req, res) => {
    const id = req.params.videoId;
    const mimeType = req.query?.mimeType || "";
    const onlyUrl = req.query?.onlyUrl || false;
    const KEY = `stream::${id}`;
    const cachedData = cache.get(KEY);

    try {
      log(`getting infor: ${yellow(id)}`)
      let streams = cachedData || await youtube.streamInfor(id).then(r => r.formats);
      if (!cachedData) cache.put(KEY, streams, 60 * 60000);
      if (mimeType) streams = streams.filter(stream => stream.mimeType.includes(mimeType));
      if (onlyUrl) streams = streams.map(stream => stream.url);
      res.status(200).json(streams);
    } catch (e) {
      log(e);
      res.sendStatus(500, e);
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

  httpsServer.listen(port, callback)
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
