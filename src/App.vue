<style>
@import 'https://cdn.jsdelivr.net/gh/minimo-io/alt-template@0.6.22/dist/alt.css';
@import './assets/app.css';
</style>
<template>
  <div id="app" :class="[isLight ? 'appLight' : 'appDark']">

      <navbar class="mb-5"></navbar>

      <main class="mt-4 px-lg-0">
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
      </main>

      <footer
      class="alt-footer pt-5 mb-0 pb-0 text-muted text-center text-small">
        <p class="mb-0">
          <span class="text-uppercase">
            <b-link href="https://github.com/minimo-io/bibliopath" class="app-text-grey text-nowrap" target="_blank"><i class="fab fa-github"></i></b-link>/{{ this.$appDetails.appVersion }}
          </span>
        </p>
        <ul class="list-inline mb-0">
          <li class="list-inline-item text-capitalize"><b-link :href="this.$appDetails.appDevUrl" class="app-text-grey text-nowrap" target="_blank">by <i class="fas fa-circle mr-1"></i>Mínimo</b-link></li>
        </ul>
      </footer>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'


export default {
  name: "home",
  data(){
    return {
      isLight: true
    }
  },
  watch: {
    '$store.state.config.appDarkMode': function() {
      if (this.$store.state.config.appDarkMode == 'light'){
        this.isLight = true;
        $('html, body').css("background-color", "white");
      }else{
        this.isLight = false;
        $('html, body').css("background-color", "black");
      }
    }
  },
  components:{
    'navbar': NavBar
  },
  methods: {

  }
};
</script>
