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
  watch: {
    '$store.state.loading': function() {
      // var loading = null;
      if (this.$store.state.loading){

        this.$ionic.loadingController
          .create({
            cssClass: 'my-custom-class',
            message: 'Please wait...',
            duration: this.timeout,
          })
          .then(loading => {
            // setTimeout(function() {
            //   loading.dismiss()
            // }, this.timeout)

            this.$store.commit("setLoadingObj", loading);
            return loading.present()
          });

      }else{
        let oLoading = this.$store.getters.getLoadingObj;

        oLoading.dismiss();
      }
    }
  },
  components:{
    'tabs': Tabs,
    'navbar': NavBar
  },
  methods: {

  }
};
</script>
