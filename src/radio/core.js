const moment = require('moment');
const tunes = require('./tunes.json');
const { sleep, requestRandomMedia } = require('../helpers');


class RadioCore {
	constructor(ioInstance) {
		this.ioInstance = ioInstance;
		this.tunes = [ ...tunes ];
		this.started = false;

		ioInstance.on('connection', (socket) => {
		  console.log(`id (${socket.id}) connected.`)
		  socket.on("connectRadio", tuneId => {
		  	let activeTune = this.tunes.some(tune => tune.id === tuneId);
		    if (activeTune) {
		      socket.join(tuneId);
		      socket.emit("updateRadioTune", this.syncTune(tuneId));
		      console.log(`${socket.id} connected at tune (${tuneId})`);      
		    }
		  })
		  socket.on("disconnectRadio", () => {
		  	let activeTune = this.tunes.some(tune => tune.id === tuneId);
		  	if (activeTune) {
			    socket.leave(tuneId);
			    console.log(`${socket.id} disconnected from radio (${tuneId})`);
			  }
		  })
		  // socket.on("disconnect", () => {
		  //   socket.disconnect();
		  //   console.log(`${socket.id} disconnected`);
		  // })
		})
	}

	async start() {
		for (let i=0; i < this.tunes.length; i++) {
			let tune = this.tunes[i];
			if (!this.started) {
				try {
					await this.updateTuneState(tune.id);
				} catch(err) {
					console.error(err);
				}
			};
			this.started = true;
		}
	}

	syncTune(tuneId) {
		const tune = this.tunes.find(tune => tune.id === tuneId);
		const timestamp = moment().add(1, 's').unix();
		tune.media.data.startIn = (timestamp - tune.media.startedAt);
		return tune;
	}

	async updateTuneState(tuneId) {
		let mediaData = await requestRandomMedia();
		let tuneIndex = this.tunes.findIndex(tune => tune.id === tuneId);
		mediaData.title = this.tunes[tuneIndex].name;
		mediaData.artists = [{ name: "Musiky" }];
		mediaData.thumbnails = [
			{ url: "https://cdn-istatics.herokuapp.com/static/imgs/illustrations/headphones-abstract-colorful.webp" },
			{ url: "https://cdn-istatics.herokuapp.com/static/imgs/illustrations/headphones-abstract-colorful.webp" },
			{ url: "https://cdn-istatics.herokuapp.com/static/imgs/illustrations/headphones-abstract-colorful.webp" }
		]

		this.tunes[tuneIndex].media.startedAt = moment().unix();
		this.tunes[tuneIndex].media.data = mediaData;
		this.ioInstance.to(tuneId).emit("updateRadioTune", this.syncTune(tuneId));
		await sleep(() => this.updateTuneState(tuneId), (mediaData.durationSec * 1000));
	}
}

module.exports = RadioCore;
