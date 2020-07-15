<template>
  <div class="mt-3">

      <ul>
        <li v-for="book in books" v-bind="books" :key="book.slug">
          <router-link :to="{ path: '/book/' + book.slug }">{{ book.title.rendered }} - {{ book._embedded.author[0].name }}</router-link>
        </li>
      </ul>
      <hr>
      <b-button @click="goToAbout" size="sm" block pill>Start here</b-button>

  </div>
</template>
<script>
import axios from "axios";
export default {
  name: 'Home',
  data(){
    return {
      books: []
    }
  },
  mounted(){
    this.$store.commit("setLoading");
    axios.get("https://alt.minimo.io/wp-json/wp/v2/posts?_embed").then((result) => {
      console.log(result.data);
      this.$store.commit("setNotLoading");
      this.books = result.data;

    });

  },
  methods: {
    goToAbout () {
      this.$router.push('about')
    },
  },
}
</script>
