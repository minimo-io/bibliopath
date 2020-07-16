<style>
@import 'https://cdn.jsdelivr.net/gh/minimo-io/alt-template@0.6.15/dist/alt.css';
@import './assets/app.css';
</style>
<template>
  <div id="app">

      <navbar class="mb-5"></navbar>

      <main class="container mt-4 px-lg-0">
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
      </main>

  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'


export default {
  name: "home",
  components:{
    'navbar': NavBar
  },
  methods: {

  }
};
</script>
