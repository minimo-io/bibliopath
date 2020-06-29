<template>
  <ion-page>
    <ion-header translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="primary">
          <ion-button @click="clickedStar()">
            <ion-icon slot="icon-only" name="star"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Bibliopath</ion-title>
        <ion-buttons slot="end">
          <ion-menu-button auto-hide="false"></ion-menu-button>

        </ion-buttons>
      </ion-toolbar>

    </ion-header>

    <ion-content padding>
          <ion-list>
            <ion-item>
              <ion-checkbox slot="start"></ion-checkbox>
              <ion-label>
                <h1>Create Idea</h1>
                <ion-note>Run Idea by Brandy</ion-note>
              </ion-label>
              <ion-badge color="success" slot="end">5 Days</ion-badge>
            </ion-item>
          </ion-list>
          <ion-fab vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button @click="$router.push({ name: 'new-item' })">
              <ion-icon name="add" />
            </ion-fab-button>
          </ion-fab>
    </ion-content>


  </ion-page>
</template>

<script>
import { add } from "ionicons/icons";
import { addIcons } from "ionicons";
addIcons({
  "ios-add": add.ios,
  "md-add": add.md
});
export default {
  name: 'Home',
  components: {
  }
}
</script>
