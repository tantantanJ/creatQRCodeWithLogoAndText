var koa = require('koa');
var app = koa();
var koa_static = require('koa-static-server');

app.use(koa_static({
	rootDir: './',
	rootPath: '/static/',
	maxage : 0
}))

app.listen(3001);
console.log('Koa server is started!');