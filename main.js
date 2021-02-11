var http = require('http');
var fs = require('fs');
var url = require('url');
 
function templateHTML(title, list, body){
	return `
	<!doctype html>
	<html>
	<head>
		<title>WEB1 - ${title}</title>
		<meta charset="utf-8">
	</head>
	<body>
		<h1><a href="/">WEB</a></h1>
		${list}
		${body}
	</body>
	</html>
	`;
}


function templataList(files){
	var list = '<ul>';
	for(var i=0 ; i<files.length ; i++){
		list = list + `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`
	}
	list = list+'</ul>'
	return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
	// path(경로)는 pathname에다가 query를 합친것임!!
    var pathname = url.parse(_url, true).pathname;
   
	if(pathname === '/'){
		if(queryData.id === undefined){	
			fs.readdir('./data', function(err, files){
				var title = 'Welcome';
				var description = 'Hello, Node.js'
				var list = templataList(files);	
				var template = templateHTML(title, list, `<h2>${title}</h2><p>${description} </p>`);
				response.writeHead(200);
				response.end(template);
			});
		} else {
			fs.readdir('./data', function(err, files){
				fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
					var title = queryData.id;
					var list = templataList(files);		
					var template = templateHTML(title, list, `<h2>${title}</h2><p>${description} </p>`);
					response.writeHead(200);
					response.end(template);
				});
			});
		}	
	} else {
		response.writeHead(404);
		response.end("Not found");
	}
 
 
});
console.log('success')
app.listen(3000);