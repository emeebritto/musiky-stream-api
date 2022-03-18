const axios = require('axios');
const moment = require('moment');
let IO_INSTANCE = null;

const getRandomSong = async() => {
	return axios.get(`https://cdn-istatics.herokuapp.com/music/all?random=1&maxResult=1`)
		.then(res => res.data.items[0]);
};

const radioChannels = {
	ch43: {
		startedAt: 16742342342,
		media: null
	},
	ch13: {
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



module.exports = { init, syncRadio };