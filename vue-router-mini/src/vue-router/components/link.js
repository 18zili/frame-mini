export default {
	props: {
		to: String,
	},
	render(h) {
		return h('a', { attrs: { href: `#${this.to}` } }, [
			this.$slots.default,
		]);
	},
};
