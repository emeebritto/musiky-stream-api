const youtube = require('./youtube')

class Downloader {
  
  handleError (params) {
    if (typeof this.onErrorCallback === 'function') {
      this.onErrorCallback(params)
    }
  }

  download ({ id, file, c, cache, m, metadata }) {
    youtube.download(
      {
        id,
        file,
        useCache: c || cache,
        addMetadata: m || metadata,
        onMetadata: this.onMetadataCallback
      },
      (error, data) => {
        if (error) {
          this.handleError({ id, file, error })
          return
        }

        if (typeof this.onSuccessCallback === 'function') {
          this.onSuccessCallback(data)
        }
      }
    )

    return this
  }

  onSuccess (callback) {
    if (typeof callback === 'function') this.onSuccessCallback = callback
    return this
  }

  onError (callback) {
    if (typeof callback === 'function') this.onErrorCallback = callback
    return this
  }

  onMetadata (callback) {
    if (typeof callback === 'function') this.onMetadataCallback = callback
    return this
  }

  setFolder(folder) {
    youtube.setFolder(folder)
    return this
  }
}

const downloader = new Downloader()
module.exports = downloader
