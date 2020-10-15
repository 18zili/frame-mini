import Link from './components/link';
import View from './components/view';

let Vue;

class VueRouter {
	constructor(options) {
		this.$options = options;
		this.routeMap = {};

		this.current = window.location.hash.slice(1) || '/';
		Vue.util.defineReactive(this, 'matched', []);

		this.match();
	}

	init() {
		// this.createRouterMap();
		this.bindEvents();
	}

	createRouterMap() {
		this.$options.routes.forEach((route) => {
			this.routeMap[route.path] = route;
		});
	}

	bindEvents() {
		window.addEventListener('hashchange', this.onHashChange.bind(this));
	}

	onHashChange() {
		this.current = window.location.hash.slice(1);
		this.matched = [];
		this.match();
	}

	match(routes) {
		routes = routes || this.$options.routes;

		for (const route of routes) {
			if (route.path === '/' && this.current === '/') {
				this.matched.push(route);
				return;
			}
			if (route.path !== '/' && ~this.current.indexOf(route.path)) {
				this.matched.push(route);
				const children = route.children;
				if (children && children.length) {
					this.match(children);
				}
				return;
			}
		}
	}
}

VueRouter.install = function(_Vue) {
	Vue = _Vue;

	Vue.mixin({
		beforeCreate() {
			const router = this.$options.router;
			if (router) {
				Vue.prototype.$router = router;
				router.init();
			}
		},
	});

	Vue.component('router-link', Link);
	Vue.component('router-view', View);
};

export default VueRouter;
