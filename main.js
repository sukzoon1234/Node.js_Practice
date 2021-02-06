var http = require('http');
var fs = require('fs');
var url = require('url');


var app = http.createServer(function(request,response){
    var _url = request.url;
	var queryData = url.parse(_url,true);
	var queryString=require('querystring');
	console.log(queryData);
	console.log(_url);
    if(_url == '/'){
    	_url = '/index.html';
    }
    if(_url == '/favicon.ico'){
     	response.writeHead(404);
		response.end();
		return;
    }
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + _url));
	//__dirname 은 현재 실행중인 폴더의 경로를 나타냄
 
});
app.listen(3000,function(){
	console.log("Access");
});