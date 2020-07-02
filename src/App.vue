<template>
  <div id="app">
    <ion-app>

      <ion-header translucent>
        <ion-toolbar color="dark">
          <ion-title>Bibliopath</ion-title>
          <!--
          <ion-buttons slot="start">
            <ion-back-button default-href="Home"></ion-back-button>
          </ion-buttons>
          -->

          <ion-buttons slot="end">
            <ion-button @click="appLoading">Loading</ion-button>
            <ion-button @click="appSearch"><ion-icon name="search"></ion-icon></ion-button>
            <ion-button @click="presentActionSheet">
              <ion-icon slot="icon-only" name="more"></ion-icon>
            </ion-button>

          </ion-buttons>

        </ion-toolbar>
      </ion-header>


      <ion-vue-router />

    </ion-app>
  </div>
</template>
<style>
ion-content{
  --padding-top: 5rem !important;
}
</style>
<script>
export default {
  name: "home",
  props: {
    timeout: { type: Number, default: 1000 },
  },
  methods: {
    presentActionSheet() {
      return this.$ionic.actionSheetController
        .create({
          header: 'Albums',
          cssClass: 'my-custom-class',
          buttons: [
            {
              text: 'Delete',
              role: 'destructive',
              icon: 'trash',
              handler: () => {
                console.log('Delete clicked')
              },
            },
            {
              text: 'Share',
              icon: 'share',
              handler: () => {
                console.log('Share clicked')
              },
            },
            {
              text: 'Play (open modal)',
              icon: 'caret-forward-circle',
              handler: () => {
                console.log('Play clicked')
              },
            },
            {
              text: 'Favorite',
              icon: 'heart',
              handler: () => {
                console.log('Favorite clicked')
              },
            },
            {
              text: 'Cancel',
              icon: 'close',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked')
              },
            },
        ],
      })
      .then(a => a.present())
    },
    appLoading() {
      return this.$ionic.loadingController
        .create({
          cssClass: 'my-custom-class',
          message: 'Please wait...',
          duration: this.timeout,
        })
        .then(loading => {
          setTimeout(function() {
            loading.dismiss()
          }, this.timeout)
          return loading.present()
        })
    },
    appSearch(){
      alert("Oh search!");
    }
  }
};
</script>
