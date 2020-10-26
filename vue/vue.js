const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
	'push',
	'pop',
	'shift',
	'unshift',
	'sort',
	'reverse',
	'splice',
];
methodsToPatch.forEach((method) => {
	const original = arrayProto[method];
	arrayMethods[method] = function () {
		const result = original.apply(this, arguments);

		const ob = this.__ob__;
		ob.dep.notify();

		return result;
	};
});

function defineReactive(obj, key, val) {
	const childOb = observe(val);
	const dep = new Dep();

	Object.defineProperty(obj, key, {
		get() {
			if (Dep.target) {
				dep.addDep(Dep.target);

				if (childOb) {
					childOb.dep.addDep(Dep.target);
				}
			}

			return val;
		},
		set(newVal) {
			if (newVal !== val) {
				val = newVal;
				observe(newVal);

				dep.notify();
			}
		},
	});
}

function observe(obj) {
	if (typeof obj !== 'object' || obj === null) {
		return;
	}

	let ob;

	if (obj.hasOwnProperty('__ob__')) {
		ob = obj.__ob__;
	} else {
		ob = new Observe(obj);
	}

	return ob;
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
		this.dep = new Dep();
		def(value, '__ob__', this);

		if (Array.isArray(value)) {
			value.__proto__ = arrayMethods;
			value.forEach((val) => observe(val));
		} else {
			this.walk(value);
		}
	}

	walk(obj) {
		Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]));
	}
}

function def(obj, key, val) {
	Object.defineProperty(obj, key, {
		configruable: true,
		enumerable: false,
		writable: true,
		value: val,
	});
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
			if (this.isDirective(name)) {
				const dir = name.substring(2);
				this[dir] && this[dir](node, value);
			}
			if (this.isEvent(name)) {
				const dir = name.substring(1);
				this.eventHandler(node, dir, value);
			}
		});
	}

	isDirective(name) {
		return name.startsWith('v-');
	}

	isEvent(name) {
		return name.startsWith('@');
	}

	eventHandler(node, dir, value) {
		const fn = this.$vm.$options.methods[value];
		node.addEventListener(dir, fn.bind(this.$vm));
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

	model(node, exp) {
		this.update(node, exp, 'model');

		node.addEventListener('input', (e) => {
			this.$vm[exp] = e.target.value;
		});
	}

	modelUpdater(node, value) {
		node.value = value;
	}
}

class Wather {
	constructor(vm, key, fn) {
		this.$vm = vm;
		this.key = key;
		this.fn = fn;

		Dep.target = this;
		this.$vm[this.key];
		Dep.target = null;
	}

	update() {
		this.fn.call(this.$vm, this.$vm[this.key]);
	}
}

class Dep {
	constructor() {
		this.deps = [];
	}

	addDep(dep) {
		this.deps.push(dep);
	}

	notify() {
		this.deps.forEach((dep) => dep.update());
	}
}
