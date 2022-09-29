const axios = require('axios');
const { istaticsUrl } = require('../consts');


const requestRandomMedia = async() => {
  return axios.get(`${istaticsUrl}/musics?random=1&maxResult=1`)
    .then(res => res.data[0])
    .catch(err => console.error(err))
}

const sleep = (fc, time) => {
  return new Promise((resolve, reject) => {
    setTimeout(()=> {
      fc();
      resolve();
    }, time);
  })
};

module.exports = { sleep, requestRandomMedia };
