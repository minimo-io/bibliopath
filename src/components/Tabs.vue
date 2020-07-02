<template>
  <!-- Listen to before and after tab change events -->
  <ion-tabs @IonTabsWillChange="beforeTabChange" @IonTabsDidChange="afterTabChange">

    <!-- Match by "app.speakers" route name -->
    <ion-tab tab="home" :routes="'Home'"></ion-tab>

    <ion-tab tab="authors">

    </ion-tab>

    <!-- Match by an array of route names -->
    <ion-tab tab="catalog">
      <h1>Catalog</h1>
    </ion-tab>

    <ion-tab tab="about"></ion-tab>

    <!-- Use v-slot:bottom with Vue ^2.6.0 -->
    <template :slot="this.tabPosition">
      <ion-tab-bar class="top-tabs">
        <!-- Provide a custom route to navigate to -->
        <ion-tab-button tab="home" :to="{ name: 'Home' }">
          <ion-icon name="home"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="catalog">
          <ion-icon name="book"></ion-icon>
          <ion-label>Books</ion-label>
          <ion-badge>6</ion-badge>
        </ion-tab-button>

        <!-- Provide extra data to route -->
        <ion-tab-button tab="authors" :to="{ name: 'Authors' }">
          <ion-icon name="contacts"></ion-icon>
          <ion-label>Authors</ion-label>
        </ion-tab-button>

        <!-- Provide custom click handler -->
        <ion-tab-button tab="about" @click="goToAboutTab">
          <ion-icon name="information-circle"></ion-icon>
          <ion-label>About</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </template>
  </ion-tabs>
</template>
<script>
export default {
  name: 'Tabs',
  data(){
    return {
      tabPosition: "bottom"
    }
  },
  methods: {
    beforeTabChange(){
    },
    afterTabChange(){

    },
    goToAboutTab(){
      console.log("About router view");
    }
  },
}
</script>
