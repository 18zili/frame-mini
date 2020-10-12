let Vue;

class VueRouter {
	constructor(options) {
		this.$options = options;
		this.routeMap = {};

		this.app = new Vue({ data: { current: '/' } });
	}

	init() {
		this.createRouterMap();
		this.bindEvents();
		this.initComponents();
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
		this.app.current = window.location.hash.slice(1) || '/';
	}

	initComponents() {
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
			functional: true,
			render(h, { parent }) {
				const router = parent.$router;
				return h(router.routeMap[router.app.current].component);
			},
		});
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
};

export default VueRouter;
