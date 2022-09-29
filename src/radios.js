const axios = require('axios');
const moment = require('moment');
const { istaticsUrl } = require('./consts');

let IO_INSTANCE = null;

const getRandomSong = async() => {
	return axios.get(`${istaticsUrl}/musics?random=1&maxResult=1`)
		.then(res => res.data[0]);
};

const radioChannels = {
	ws_ch43: {
		startedAt: 16742342342,
		media: null
	},
	ws_ch13: {
		startedAt: 16742384242,
		media: null
	}
};

const syncRadio = radioId => {
	let music = radioChannels[radioId].media;
	let time = moment().unix();
	music.startIn = time - radioChannels[radioId].startedAt;
	return music;
};

const updateRadio = async(radioId) => {
	let music = await getRandomSong();
	radioChannels[radioId].startedAt = moment().unix();
	radioChannels[radioId].media = music;
	IO_INSTANCE.to(radioId).emit("update-channel", syncRadio(radioId));
	setTimeout(() => {
		updateRadio(radioId);
	}, music.durationSec * 1000);
};

const init = async(io) => {
	IO_INSTANCE = io;
	const channelsId = Object.keys(radioChannels);
	for (id of channelsId) {
		if (!radioChannels[id].media) {
			updateRadio(id);
		}
	}
};

const isActive = mediaId => {
	return !!radioChannels[mediaId];
};



module.exports = { init, syncRadio, isActive };