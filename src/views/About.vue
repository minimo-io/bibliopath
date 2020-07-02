<template>
  <ion-content padding>

    <p>Hey! So this is the primitive Bibliopath:<br>The Open Editorial.</p>

    <ion-button @click="goBackHome()" full>Go Back!</ion-button>

  </ion-content>
</template>
<script>
export default {
  name: 'About',
  methods: {
      goBackHome () {
        this.$router.push('/')
      },

    }
}
</script>
