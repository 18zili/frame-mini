export default {
	render(h) {
		this.$vnode.data.routerView = true;

		let parent = this.$parent;

		let depth = 0;
		while (parent) {
			const vnodeData = parent.$vnode ? parent.$vnode.data : {};
			if (vnodeData.routerView) {
				depth++;
			}
			parent = parent.$parent;
		}

		const matched = this.$router.matched;
		const route = matched[depth];
		const component = route ? route.component : null;
		return h(component);
	},
};
