<template>
  <div>
    <div class="author-view mt-3 pt-0 pb-3">
      <b-avatar variant="light" size="5rem" :src="author.avatar" class="mr-3"></b-avatar>
      <h1>{{ author.name }}</h1>
      <b-badge pill variant="danger" style="opacity:.5;"><i class="fas fa-user-check mr-1"></i>28 followers</b-badge>
      <b-badge pill variant="warning" class="ml-1" style="opacity:.5;"><i class="fas fa-coins mr-1"></i>2 donors</b-badge>

       <div v-if="author.description" v-html="author.description" class="author-description mt-3 px-5"></div>
    </div>
    <ul class="mt-5">
      <li v-for="book in author.books" v-bind="author" :key="book.id">
        <router-link :to="{ path: '/book/' + book.slug }">{{ book.title.rendered }} - {{ book._embedded.author[0].name }}</router-link>
      </li>
    </ul>
    <!-- <div v-html="book.content" class="book-content"></div> -->
  </div>
</template>
<style scoped>

</style>
<script>
  import axios from 'axios'

  export default{
    name: "Author",
    data(){
      return {
        author: {
          id: null,
          slug: this.$route.params.slug,
          name: null,
          description: null,
          avatar: null,
          books: []
        }
      }
    },
    mounted(){
      this.$store.commit("setLoading");
      axios.get("https://alt.minimo.io/wp-json/wp/v2/users/?slug="+ this.author.slug +"&_embed").then((result) => {

        this.$store.commit("setNotLoading");
        this.author.id = result.data[0].id;
        this.author.name = result.data[0].name;
        this.author.description = result.data[0].description;
        // this.book.title = result.data[0].title.rendered;
        // this.book.author.name = result.data[0]._embedded.author[0].name;
        // this.book.author.slug = result.data[0]._embedded.author[0].slug;
        // this.book.author.avatar = result.data[0]._embedded.author[0].avatar_urls[48];
        //this.book.presentation = result.data[0]._embedded["wp:featuredmedia"][0].source_url;
        this.$store.commit("setLoading");
        axios.get("https://alt.minimo.io/wp-json/wp/v2/posts/?author="+ this.author.id +"&_embed").then((result) => {

          this.$store.commit("setNotLoading");

          this.author.books = result.data;




        });


      });
    }
  }
</script>
