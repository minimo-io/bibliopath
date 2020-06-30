<template>
  <ion-app>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>
        Bibliopath
      </ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content padding>
    The world is your oyster.
    <p>Heyyy esto es lo que se llama el primitivo inicio de Bibliopath, la editorial abierta.</p>
  </ion-content>
  <ion-button @click="goToAbout" full>Go to About</ion-button>
  </ion-app>
</template>

<script>

export default {
  name: 'Home',
  methods: {
    goToAbout () {
      this.$router.push('about')
    },

  },
  components: {

  }
}
</script>
