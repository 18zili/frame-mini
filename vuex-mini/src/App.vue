<template>
	<div id="app">
		<p>counter: {{ $store.state.counter }}</p>
		<button @click="$store.commit('add')">add</button>
		<button @click="$store.dispatch('add')">sync add</button>
		<p>doubleCounter: {{ $store.getters.doubleCounter }}</p>
	</div>
</template>

<script>
export default {
	name: 'App',
	components: {},
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
