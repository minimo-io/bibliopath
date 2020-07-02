<style>@import './assets/app.css';</style>
<template>
  <div id="app">
    <ion-app>

      <navbar></navbar>

      <ion-vue-router />


      <tabs></tabs>

    </ion-app>
  </div>
</template>

<script>
// import Modal from '@/components/Modal.vue'
import NavBar from '@/components/NavBar.vue'
import Tabs from '@/components/Tabs.vue'
export default {
  name: "home",
  components:{
    'tabs': Tabs,
    'navbar': NavBar
  },

  methods: {

  }
};
</script>
