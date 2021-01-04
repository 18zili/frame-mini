const fs = require('fs');
const path = require('path');
const Router = require('koa-router');

function loadFile(dir, cb) {
	const url = path.resolve(__dirname, dir);
	const files = fs.readdirSync(url);
	files.forEach((filename) => {
		filename = filename.replace('.js', '');
		const file = require(url + '/' + filename);
		cb(filename, file);
	});
}

function initRouter(app) {
	const router = new Router();
	loadFile('routes', (filename, routes) => {
		const prefix = filename === 'index' ? '' : `/${filename}`;

		routes = typeof routes === 'function' ? routes(app) : routes;

		Object.keys(routes).forEach((key) => {
			const [method, path] = key.split(' ');
			router[method](prefix + (path === '/' ? '' : path), routes[key]);
		});
	});
	return router;
}

function initController() {
	const controllers = {};
	loadFile('controller', (filename, controller) => {
		controllers[filename] = controller;
	});
	return controllers;
}

module.exports = {
	initRouter,
	initController,
};
