const fs = require('fs');
const whileExistFile = async(file) => {
	new Promise((resolve, reject) => {
		let wait = true;
		while (wait) {
			wait = !!fs.existsSync(file);
		}
		resolve();
	})
};

module.exports = whileExistFile;