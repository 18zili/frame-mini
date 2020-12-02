const isObject = (val) => val !== null && typeof val === 'object';

// 避免重复代理：创建两个map，利用map做缓存，每次处理之前看看缓存里有没有
// WeakMap: key 可以是 object、数据只要没有地方使用就可以被回收
const toProxy = new WeakMap(); // key = data：value = observed
const toRaw = new WeakMap(); // key = observed：value = data

function reactive(data) {
	if (!isObject(data)) {
		return data;
	}

	// 先查找缓存，避免重复代理
	if (toProxy.has(data)) {
		return toProxy.get(data);
	}

	// data 已经代理过了，直接返回
	if (toRaw.has(data)) {
		return data;
	}

	const observed = new Proxy(data, {
		get(target, key, receiver) {
			const res = Reflect.get(target, key, receiver);
			console.log('get', key, res);
			// 运行时递归处理
			return isObject(res) ? reactive(res) : res;
		},
		set(target, key, value, receiver) {
			const res = Reflect.set(target, key, value, receiver);
			console.log('set', key, res);
			return res;
		},
		deleteProperty(target, key) {
			const res = Reflect.deleteProperty(target, key);
			console.log('delate', key, res);
			return res;
		},
	});

	// 缓存
	toProxy.set(data, observed);
	toRaw.set(observed, data);

	return observed;
}

const data = {
	foo: 'foo',
	bar: {
		a: 1,
	},
	arr: [1, 2],
};
const state = reactive(data);

console.log('测试缓存 toRaw', reactive(state) === state);

console.log('测试缓存 toProxy', reactive(data) === state);

state.foo;

state.foo = 'foooooooo';

state.bar.a = 10;

delete state.foo;

state.arr.push(3);
