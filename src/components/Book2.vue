<template>
  <div v-if="content">
      <div class="book-presentation mt-4 pt-4">
        <h1>{{ book.title }}</h1>
        <div class="author-meta">
          by <b-avatar variant="light" size="2.2rem" :src="book.author.avatar" class="mr-2 ml-2"></b-avatar>
          <span class="mr-auto"><b-link :to="{ name: 'Author', params: { slug: book.author.slug } }">{{ book.author.name }}</b-link></span>
        </div>
      </div>
      <img :src="book.presentation" />

      <div v-html="content" class="book-content"></div>
  </div>
</template>
<script lang="ts">
  import axios from "axios"

  export default{
    data(){
      return {
        isBookLoaded: false,
        content: null,
        book: {
          slug: this.$route.params.slug,
          title: null,
          author: { name: null, slug: null, avatar: null },
          // content: null,
          presentation: null
        }
      }
    },
    watch: {
      content: function (val) {
        if(val){
          this.$nextTick(()=>{

            // if (this.isBookInit == false){
              let titlesCount = $(".book-content h2");
              console.log("LENSSXPP: " + titlesCount.length);

              // finally set it to loaded
            // }
          })
        }
      },
    },
    mounted(){
      this.$store.commit("setLoading");
      axios.get(this.$appDetails.appAPIUri + "/wp-json/wp/v2/posts?slug="+ this.book.slug +"&_embed").then((result) => {
         // console.log(result);
        this.$store.commit("setNotLoading");

        this.content = result.data[0].content.rendered;
        this.book.title = result.data[0].title.rendered;
        this.book.author.name = result.data[0]._embedded.author[0].name;
        this.book.author.slug = result.data[0]._embedded.author[0].slug;
        this.book.author.avatar = result.data[0]._embedded.author[0].acf.author_avatar;
        //this.book.presentation = result.data[0]._embedded["wp:featuredmedia"][0].source_url;



      });
    }

  }
</script>
