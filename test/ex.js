var url = require('url');
var urlObject=url.parse('http://localhost:3000/path/abc.php?id=student&page=12#hash',true);

console.log(urlObject.path);
console.log(urlObject.pathname);
console.log(urlObject.query);
console.log(urlObject.query.id);