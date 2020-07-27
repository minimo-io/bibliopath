<style>
@import 'https://cdn.jsdelivr.net/gh/minimo-io/alt-template@0.6.22/dist/alt.css';
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

      <footer
      class="alt-footer my-5 pt-5 text-muted text-center text-small">
        <p class="mb-0">© 2020 <span class="text-uppercase">{{ this.$appDetails.appName }}</span><br>v. {{ require('../package.json').version || '1' }}</p>
        <ul class="list-inline">
          <li class="list-inline-item text-capitalize"><b-link :href="this.$appDetails.appDevName" class="app-text-grey text-nowrap" target="_blank">by <i class="fas fa-circle mr-1"></i>Mínimo</b-link></li>
        </ul>
      </footer>
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
