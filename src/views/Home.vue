<template>
  <ion-content padding>
     <ion-grid fixed>
      <ion-button @click="goToAbout" expand="block" color="dark" shape="round" fill="outline">Start here</ion-button>
      <hr>
      <!-- <router-link :to="{ path: '/book/seneca' }">Seneca's Morals of a Happy Life.</router-link> -->
      <br>
      The world is your oyster.

      <ul id="example-1">
        <li v-for="book in books" v-bind="books" :key="book.id">
          <router-link :to="{ path: '/book/' + book.slug }">{{ book.title }} - {{ book.author }}</router-link>
        </li>

      </ul>

    </ion-grid>

  </ion-content>
</template>

<style>
@media (min-width: 1200px){
  .grid-fixed {
      width: inherit !important;
  }

}
@media (min-width: 992px){
  .grid-fixed {
    width: var(--ion-grid-width-lg,var(--ion-grid-width,960px)) !important;
  }
}


</style>
<script>
import Firebase from '@/firebase'
export default {
  name: 'Home',
  data(){
    return {
      books: []
    }
  },
  mounted(){
    let itemsRef = Firebase.database().ref("books");
    itemsRef.on("value", snapshot => {
       let data = snapshot.val();
       this.books = data;
       let messages = [];
       Object.keys(data).forEach(key => {
         // messages.push({
         //   id: key,
         //   username: data[key].username,
         //   text: data[key].text
         // });
         // console.log(data[key].book);

       });
       // viewMessage.messages = messages;
   });
  },
  methods: {
    goToAbout () {
      this.$router.push('about')
    },
  },
}
</script>
