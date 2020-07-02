<template>
  <ion-content padding>

    This is the About page.
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
