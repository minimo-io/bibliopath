<template>
  <ion-content padding>

    This is the Catalog damn page, kinda... Empty?
    <ion-button @click="goBackHome()" full>Outta here!</ion-button>

  </ion-content>
</template>
<script>
export default {
  name: 'Catalog',
  methods: {
      goBackHome () {
        this.$router.push('/')
      },

    }
}
</script>
