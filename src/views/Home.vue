<template>
  <ion-app>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>
        Heyyy esto es lo que se llama el primitivo inicio de Bibliopath, la editorial abierta.
      </ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content padding>
    The world is your oyster.
    <p>If you get lost, the <a href="https://ionicframework.com/docs">docs</a> will be your guide.</p>
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
