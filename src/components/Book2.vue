<template>
  <div>
      <div class="book-presentation mt-4 pt-4">
        <h1>{{ book.title }}</h1>

         <b-avatar variant="light" size="2.2rem" :src="book.author.avatar" class="mr-3"></b-avatar>
         <span class="mr-auto"><b-link :to="{ name: 'Author', params: { slug: book.author.slug } }">{{ book.author.name }}</b-link></span>

      </div>
      <img :src="book.presentation" />

      <div v-html="book.content" class="book-content"></div>
  </div>
</template>
<script lang="ts">
  import axios from "axios";
  export default{
    data(){
      return {
        book: {
          slug: this.$route.params.slug,
          title: null,
          author: { name: null, slug: null, avatar: null },
          content: null,
          presentation: null
        }
      }
    },
    mounted(){
      this.$store.commit("setLoading");
      axios.get(this.$appDetails.appAPIUri + "/wp-json/wp/v2/posts?slug="+ this.book.slug +"&_embed").then((result) => {
         console.log(result);
        this.$store.commit("setNotLoading");
        this.book.content = result.data[0].content.rendered;
        this.book.title = result.data[0].title.rendered;
        this.book.author.name = result.data[0]._embedded.author[0].name;
        this.book.author.slug = result.data[0]._embedded.author[0].slug;
        this.book.author.avatar = result.data[0]._embedded.author[0].avatar_urls[48];
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
