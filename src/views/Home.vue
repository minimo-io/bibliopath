<template>
  <div>
    <b-button @click="goToAbout" size="sm" block pill>Start here</b-button>
    <br>
    <b-card-group deck>
        <book-card
          v-for="book in books"
          v-bind="books"
          :key="book.id"
          :imgSrc="book.acf.book_cover.sizes.large"
          :imgAlt="book.acf.book_cover.alt"
          :title="book.title.rendered"
          :slug="book.slug"
          >
        </book-card>
    </b-card-group>
  </div>
</template>
<script>
import axios from "axios";
import BookCard from "@/components/BookCard";
export default {
  name: 'Home',
  components: {"book-card": BookCard},
  data(){
    return {
      books: []
    }
  },
  mounted(){
    this.$store.commit("setIsBook", false);
    this.$store.commit("setLoading");
    axios.get(this.$appDetails.appAPIUri + "/wp-json/wp/v2/posts?_embed").then((result) => {

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
