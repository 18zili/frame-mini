export default {
	render(h) {
		this.$vnode.data.routerView = true;

		let parent = this.$parent;

		// 嵌套路由 逐层查找父级，看看当前视图嵌套的深度
		let depth = 0;
		while (parent) {
			const vnodeData = parent.$vnode ? parent.$vnode.data : {};
			if (vnodeData.routerView) {
				// 发现一个视图 深度+1
				depth++;
			}
			parent = parent.$parent;
		}

		// 取出 router 配置对应的组件并渲染
		const matched = this.$router.matched;
		const route = matched[depth];
		const component = route ? route.component : null;
		return h(component);
	},
};
