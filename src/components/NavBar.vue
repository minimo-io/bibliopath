<template>
  <ion-header translucent>
      <ion-toolbar color="dark" fixed>
        <ion-row align-items-center class="row">
          <ion-col size="auto">
              <ion-title class="logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><title>ionicons-v5-h</title><path d="M352,48H160a48,48,0,0,0-48,48V464L256,336,400,464V96A48,48,0,0,0,352,48Z" style="fill:#FFF;stroke:#FFF;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                BIBLIOPATH
              </ion-title>
          </ion-col>
          <ion-col>
            <ion-searchbar no-padding class="ion-hide-lg-down" :placeholder="this.searchplaceholder"></ion-searchbar>
          </ion-col>
          <ion-col size="auto">
            <ion-buttons>
              <ion-button>Sign In</ion-button>
              <ion-button @click="presentActionSheet">
                <ion-icon slot="icon-only" name="more"></ion-icon>
              </ion-button>

            </ion-buttons>
          </ion-col>
        </ion-row>
        <!--
        <ion-buttons slot="start">
          <ion-back-button default-href="Home"></ion-back-button>
        </ion-buttons> -->
      </ion-toolbar>
      <ion-searchbar no-padding class="ion-hide-lg-up" :placeholder="this.searchplaceholder"></ion-searchbar>

  </ion-header>
</template>
<script>
export default{
  name: "NavBar",
  data(){
    return {
      searchplaceholder: "Search in catalog"
    }
  },
  methods:{
    presentActionSheet() {
      return this.$ionic.actionSheetController
        .create({
          header: 'Albums',
          cssClass: 'my-custom-class',
          buttons: [
            {
              text: 'Read offline',
              role: 'destructive',
              icon: 'download',
              handler: () => {
                console.log('User offline')
              },
            },
            {
              text: 'Add to favorites',
              icon: 'heart',
              handler: () => {
                console.log('Favorite clicked')
              },
            },
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
              text: 'Table of contents',
              icon: 'caret-forward-circle',
              handler: () => {
                console.log('Play clicked')
              },
            },
            {
              text: 'Go to page',
              icon: 'caret-forward-circle',
              handler: () => {
                console.log('Play clicked')
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
    // appSearch(){
    //
    //   return this.$ionic.modalController
    //           .create({
    //             component: Modal,
    //             cssClass: 'my-custom-class',
    //             componentProps: {
    //               data: {
    //                 content: 'New Content',
    //               },
    //               propsData: {
    //                 title: 'Search',
    //               },
    //             },
    //           })
    //           .then(m => m.present())
    // }
  }
}
</script>
