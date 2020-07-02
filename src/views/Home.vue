<template>
  <ion-content padding>
     <ion-grid fixed>

      <router-link :to="{ path: '/book/seneca' }">
        Seneca's Morals of a Happy Life, Benefits, Anger and Clemency
      </router-link>
      The world is your oyster.
      <p>Heyyy esto es lo que se llama el primitivo inicio de Bibliopath, la editorial abierta.</p>

      <ion-button @click="goToAbout" expand="block" color="dark" shape="round" fill="outline">Go to About</ion-button>
    </ion-grid>

  </ion-content>
</template>

<style>
@media (min-width: 1200px){
  .grid-fixed {
      width: inherit !important;
  }

}
@media (min-width: 992px){
  .grid-fixed {
    width: var(--ion-grid-width-lg,var(--ion-grid-width,960px)) !important;
  }
}


</style>
<script>
export default {
  name: 'Home',
  methods: {
    goToAbout () {
      this.$router.push('about')
    },

  },
}
</script>
