const fs = require('fs');
fs.readFile('./nodejs/sample.txt', 'utf8', (err, data) => { //폴더경로 신경쓰기!
	console.log(data);
});