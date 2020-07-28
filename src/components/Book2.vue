<template>
  <div v-if="content">
    <b-card class="py-3 py-md-5 mb-4 mb-sm-0"
    no-body>

      <b-card-body class="z-index-6000">
        <div class="book-presentation mt-4 pt-4">
          <h1>
            {{ book.title }}
            <sup><b-badge pill variant="danger" class="title-followers softer">252</b-badge></sup>
          </h1>
          <div class="author-meta mt-2">
            by <b-avatar variant="light" size="2.2rem" :src="book.author.avatar" class="mr-2 ml-2"></b-avatar>
            <span class="mr-auto"><b-link :to="{ name: 'Author', params: { slug: book.author.slug } }">{{ book.author.name }}</b-link></span>
          </div>
        </div>
        <img :src="book.presentation" />
        <div class="book-meta softer mb-3 text-center text-sm-left">
          <!-- <span class="badge badge-info mr-2">{{ book.license }}</span> -->
          <!-- <span class="badge badge-info mr-2">{{ book.modified }}</span> -->
          <b-link href="#"><b-button variant="danger" size="sm" class="mr-2"><i class="far fa-heart mr-1"></i>Like</b-button></b-link>
          <b-link href="#"><b-button variant="info" size="sm" class="mr-2"><i class="fas fa-plus mr-1"></i>Info</b-button></b-link>
          <b-link :to="{ name: 'Author', params: { slug: book.author.slug } }"><b-button variant="green" size="sm"><i class="fas fa-user mr-1"></i>Bio</b-button></b-link>
        </div>

      </b-card-body>
      <div class="overlay overlay-dark"></div>

    </b-card>
    <b-card class="mt-3">
      <b-card-title>Other readers <b-badge variant="danger softer">252</b-badge></b-card-title>
      <b-card-text>
        <b-avatar-group size="40px">
          <b-avatar></b-avatar>
          <b-avatar text="BV" variant="primary"></b-avatar>
          <b-avatar src="https://placekitten.com/300/300" variant="info"></b-avatar>
          <b-avatar text="OK" variant="danger"></b-avatar>
          <b-avatar variant="warning"></b-avatar>
          <b-avatar src="https://placekitten.com/320/320" variant="dark"></b-avatar>
          <b-avatar icon="music-note" variant="success"></b-avatar>
          <b-avatar variant="warning"></b-avatar>
          <b-avatar src="https://placekitten.com/320/320" variant="dark"></b-avatar>
          <b-avatar icon="music-note" variant="success"></b-avatar>
        </b-avatar-group>
      </b-card-text>
    </b-card>
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
          presentation: null,
          modified: null,
          license: null
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
         console.log(result.data[0].acf.book_license);
        this.$store.commit("setNotLoading");

        this.content = result.data[0].content.rendered;
        // this.book = result.data[0];
        this.book.title = result.data[0].title.rendered;
        this.book.modified = result.data[0].modified;
        this.book.license = result.data[0].acf.book_license;
        this.book.author.name = result.data[0]._embedded.author[0].name;
        this.book.author.slug = result.data[0]._embedded.author[0].slug;
        this.book.author.avatar = result.data[0]._embedded.author[0].acf.author_avatar;
        //this.book.presentation = result.data[0]._embedded["wp:featuredmedia"][0].source_url;



      });
    }

  }
</script>
