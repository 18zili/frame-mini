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
			// 依赖收集: 创建target,key 和 正在活动的那个回调函数
			track(target, key);
			// 运行时递归处理
			return isObject(res) ? reactive(res) : res;
		},
		set(target, key, value, receiver) {
			const res = Reflect.set(target, key, value, receiver);
			console.log('set', key, res);
			trigger(target, key);
			return res;
		},
		deleteProperty(target, key) {
			const res = Reflect.deleteProperty(target, key);
			console.log('delate', key, res);
			trigger(target, key);
			return res;
		},
	});

	// 缓存
	toProxy.set(data, observed);
	toRaw.set(observed, data);

	return observed;
}

// target,get和响应函数的映射关系
/*
	<WeakMap> {
		target: <Map> {
			key: <Set> [effect1, ...]
		}
	}
*/

// 创建活动函数数组
const effectStack = [];

// 将回调函数保存起来备用，立即执行一次回调函数触发它里面一些响应式数据的getter
// watch 和 computed 的底层实现使用了 effect
function effect(fn) {
	const rxEffect = function () {
		try {
			// 入栈 触发getter
			effectStack.push(fn);
			// 立刻执行
			return fn();
		} catch (error) {
		} finally {
			// 出栈
			// 触发getter后马上出栈
			effectStack.pop(fn);
		}
	};

	rxEffect();

	return rxEffect;
}

// 大管家，整个程序只有一个
const targetMap = new WeakMap();

// getter中调用track，把前面存储的回调函数和当前target，key之间建立映射关系
function track(target, key) {
	// 获取活动回调
	const effect = effectStack[effectStack.length - 1];
	if (effect) {
		// target有没有映射关系
		let depsMap = targetMap.get(target);
		if (!depsMap) {
			depsMap = new Map();
			// targetMap =  <WeakMap> { data: <Map> }
			targetMap.set(target, depsMap);
		}

		// 获取key对应的回调集合
		let deps = depsMap.get(key);
		if (!deps) {
			deps = new Set();
			// targetMap =  <WeakMap> { data: <Map>[Set] }
			depsMap.set(key, deps);
		}

		// 把响应函数加入到deps
		deps.add(effect);
	}
}

// setter中调用trigger，把target，key对应的响应函数都执行一遍
function trigger(target, key) {
	const depsMap = targetMap.get(target);
	if (depsMap) {
		const deps = depsMap.get(key);
		if (deps) {
			deps.forEach((effect) => effect());
		}
	}
}

/*
	测试代码
*/

const state = reactive({ foo: 'foo' });

effect(() => {
	console.log('effect:', state.foo);
});

state.foo;

state.foo = 'foooooo';

delete state.foo;
