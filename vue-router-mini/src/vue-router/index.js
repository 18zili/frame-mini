import Link from './components/link';
import View from './components/view';

let Vue;

class VueRouter {
	constructor(options) {
		this.$options = options;
		this.routeMap = {};

		this.current = window.location.hash.slice(1) || '/';

		// 数据必须是响应式的，这样change的时候才会更新视图
		// this.matched = [];
		Vue.util.defineReactive(this, 'matched', []);

		this.match();
	}

	init() {
		// 监听 hash 变化
		this.bindEvents();
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
		// 根据 current 在 routes 中查询相匹配的 route
		routes = routes || this.$options.routes;

		for (const route of routes) {
			if (route.path === '/' && this.current === '/') {
				// 根路由直接返回
				this.matched.push(route);
				return;
			}
			if (route.path !== '/' && ~this.current.indexOf(route.path)) {
				//  [ { path: '/about', ...} ]
				this.matched.push(route);
				const children = route.children;
				if (children && children.length) {
					//  [ { path: '/about', ...}, { path: '/about/info' } ]
					this.match(children);
				}
				return;
			}
		}
	}
}

// Vue 插件必须实现 install 方法
VueRouter.install = function(_Vue) {
	Vue = _Vue;

	// 全局混入
	Vue.mixin({
		beforeCreate() {
			const router = this.$options.router;
			if (router) {
				// 挂载 router 并初始化
				Vue.prototype.$router = router;
				router.init();
			}
		},
	});

	// 注册全局组件
	Vue.component('router-link', Link);
	Vue.component('router-view', View);
};

export default VueRouter;
