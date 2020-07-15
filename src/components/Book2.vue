<template>
  <ion-content>
    <ion-grid fixed>

      <div class="book-presentation">
        <h1>{{ book.title }}</h1>
        by
        <h2>{{ book.author }}</h2>
      </div>
      <img :src="book.presentation" />

      <div v-html="book.content" class="book-content"></div>

    </ion-grid>
  </ion-content>
</template>

<style scoped>
.book-presentation{
  text-align:center;
}
.book-presentation h2{ font-size:1rem; }
.book-content{
  padding:2rem;
  text-align:justify;
}
.book-content p{
  font-size:12px;
}
.swiper-slide{
  display:block;

}
</style>
<script lang="ts">
  // import { Component, Vue } from 'vue-property-decorator';
  import axios from "axios";
  export default{
    data(){
      return {
        slideOpts: {
          initialSlide: 1,
          speed: 300,
          spaceBetween: 100
        },
        book: {
          slug: this.$route.params.slug,
          title: null,
          author: null,
          content: null,
          presentation: null
        }
      }
    },
    mounted(){
      this.$store.commit("setLoading"); // app loading something
      axios.get("https://alt.minimo.io/wp-json/wp/v2/posts?slug="+ this.book.slug +"&_embed").then((result) => {
        // console.log(result);
        this.$store.commit("setNotLoading");
        this.book.content = result.data[0].content.rendered;
        this.book.title = result.data[0].title.rendered;
        this.book.author = result.data[0]._embedded.author[0].name;
        //this.book.presentation = result.data[0]._embedded["wp:featuredmedia"][0].source_url;
      });
    },
    methods:{
      textTap(){
        alert("OHHH");
      }
    }

  }
</script>
