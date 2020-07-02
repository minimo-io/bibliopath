<template>
  <ion-content padding>
    <ion-searchbar></ion-searchbar>
    <router-link :to="{ path: '/book/seneca' }">
      Seneca's Morals of a Happy Life, Benefits, Anger and Clemency
    </router-link>
    The world is your oyster.
    <p>Heyyy esto es lo que se llama el primitivo inicio de Bibliopath, la editorial abierta.</p>
    <ion-button @click="goToAbout" full>Go to About</ion-button>


  </ion-content>
</template>

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
