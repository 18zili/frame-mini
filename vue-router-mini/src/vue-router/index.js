let Vue;

class VueRouter {
	constructor(options) {
		this.$options = options;
		this.routeMap = {};

		Vue.util.defineReactive(this, 'current', '/');
	}

	init() {
		this.createRouterMap();
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
		this.current = window.location.hash.slice(1) || '/';
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

	Vue.component('router-link', {
		props: {
			to: String,
		},
		render(h) {
			return h('a', { attrs: { href: `#${this.to}` } }, [
				this.$slots.default,
			]);
		},
	});

	Vue.component('router-view', {
		render(h) {
			const { current, routeMap } = this.$router;
			return h(routeMap[current].component || null);
		},
	});
};

export default VueRouter;
