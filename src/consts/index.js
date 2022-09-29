require('dotenv').config();

const dev_env = Boolean(process.env.DEV_ENV);
const istaticsProd = "https://cdn-istatics.herokuapp.com";
const istaticsDev = "http://localhost:9872";
const istaticsUrl = dev_env ? istaticsDev : istaticsProd;


module.exports = {
	dev_env,
	istaticsUrl
}
