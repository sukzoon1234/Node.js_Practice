const testFolder = './data/';
const fs = require('fs');

 // 특정 디렉토리에 있는 파일의 목록을 배열로 만들어서 전달해주는 함수(?)
fs.readdir(testFolder, (err, filelist) => {
	console.log(filelist);
	filelist.forEach(file => {
		console.log(file);
	});
})