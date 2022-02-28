const axios = require('axios');

module.exports = {
	videoStream({ id, output }) {
    return axios({
      url:`https://v.pinimg.com/videos/mc/720p/${id.replace(/:/ig,'/')}.mp4`,
      method:'GET',
      responseType: 'stream'
    }).then(media => media.data.pipe(output))
	}
}
