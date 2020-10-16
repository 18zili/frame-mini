let Vue;

class Store {
	constructor(options) {
		this._mutations = options.mutations;
		this._actions = options.actions;
		this._wrappedGetters = options.getters;

		const store = this;
		const computed = {};
		this.getters = {};

		Object.keys(this._wrappedGetters).forEach((key) => {
			const fn = store._wrappedGetters[key];

			computed[key] = function() {
				return fn(store.state);
			};

			Object.defineProperty(store.getters, key, {
				get: () => store._vm[key],
			});
		});

		// $$xxxx: 藏起来 数据不会代理到 this._vm 上，如： this._vm.xx;
		this._vm = new Vue({
			data: {
				$$state: options.state,
			},
			computed,
		});

		// 修复 this 指向
		this.commit = this.commit.bind(this);
		this.dispatch = this.dispatch.bind(this);
	}

	// 将数据变成只读的
	get state() {
		return this._vm._data.$$state;
	}

	set state(_) {
		console.error('此路不同，请绕行！');
	}

	commit(type, payload) {
		const entry = this._mutations[type];
		if (!entry) console.error('not fount ' + type + 'mutations');
		entry(this.state, payload);
	}

	dispatch(type, payload) {
		const entry = this._actions[type];
		if (!entry) console.error('not fount ' + type + 'actions');
		entry(this, payload);
	}
}

function install(_Vue) {
	Vue = _Vue;

	Vue.mixin({
		beforeCreate() {
			const store = this.$options.store;
			if (store) {
				Vue.prototype.$store = store;
			}
		},
	});
}

export default { Store, install };
