<template>
    <b-card
    :img-src="book.acf.book_cover.sizes.large"
    :img-alt="book.acf.book_cover.alt"
    img-top
    class="book-card">
      <b-link class="book-card-link" :to="'/book/'+book.slug"></b-link>
      <b-card-text class="text-center" v-html="book.title.rendered"></b-card-text>

    </b-card>
</template>
<style scoped>
  #book-area{
    margin:auto;
    max-width:700px;
  }
</style>
<script>

export default {
  name: 'BookCard',
  data () {
    return {
      book: null
    }
  },
  mounted(){

  },
  methods: {


  }
}
</script>
