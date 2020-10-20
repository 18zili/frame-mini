function defineReactive(obj, key, val) {
	observe(val);

	Object.defineProperty(obj, key, {
		get() {
			return val;
		},
		set(newVal) {
			if (newVal !== val) {
				val = newVal;
				observe(newVal);

				wathers.forEach((w) => w.update());
			}
		},
	});
}

function observe(obj) {
	if (typeof obj !== 'object' || obj === null) {
		return;
	}

	new Observe(obj);
}

function proxy(vm) {
	Object.keys(vm.$data).forEach((key) => {
		Object.defineProperty(vm, key, {
			get() {
				return vm.$data[key];
			},
			set(newVal) {
				vm.$data[key] = newVal;
			},
		});
	});
}

class Observe {
	constructor(value) {
		if (Array.isArray(value)) {
			// TODO: 数组响应式
		} else {
			this.walk(value);
		}
	}

	walk(obj) {
		Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]));
	}
}

class Vue {
	constructor(options) {
		this.$options = options;
		this.$data = options.data;

		observe(this.$data);
		proxy(this);

		new Compile(options.el, this);
	}
}

class Compile {
	constructor(el, vm) {
		this.$vm = vm;
		this.$el = document.querySelector(el);

		this.compile(this.$el);
	}

	compile(el) {
		el.childNodes.forEach((node) => {
			if (node.nodeType === 1) {
				this.compileElement(node);
			} else if (this.isInter(node)) {
				this.compileText(node);
			}

			if (node.childNodes) {
				this.compile(node);
			}
		});
	}

	isInter(node) {
		return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
	}

	compileText(node) {
		this.update(node, RegExp.$1.trim(), 'text');
	}

	compileElement(node) {
		const attrs = node.attributes;
		Array.from(attrs).forEach((attr) => {
			const { name, value } = attr;
			if (name.startsWith('v-')) {
				const dir = name.substring(2);
				this[dir] && this[dir](node, value);
			}
		});
	}

	update(node, exp, dir) {
		const fn = this[dir + 'Updater'];
		fn && fn(node, this.$vm[exp]);

		new Wather(this.$vm, exp, (val) => {
			fn && fn(node, val);
		});
	}

	text(node, exp) {
		this.update(node, exp, 'text');
	}

	textUpdater(node, value) {
		node.textContent = value;
	}

	html(node, exp) {
		this.update(node, exp, 'html');
	}

	htmlUpdater(node, value) {
		node.innerHTML = value;
	}
}

const wathers = [];
class Wather {
	constructor(vm, key, fn) {
		this.$vm = vm;
		this.key = key;
		this.fn = fn;

		wathers.push(this);
	}

	update() {
		this.fn.call(this.$vm, this.$vm[this.key]);
	}
}
