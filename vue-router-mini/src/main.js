import Vue from 'vue';
import App from './App.vue';

import VueRouter from './vue-router/index';

import Home from './pages/home';
import About from './pages/about';

Vue.config.productionTip = false;

Vue.use(VueRouter);

const router = new VueRouter({
	routes: [
		{
			path: '/',
			component: Home,
		},
		{
			path: '/about',
			component: About,
		},
	],
});

new Vue({
	router,
	render: (h) => h(App),
}).$mount('#app');
