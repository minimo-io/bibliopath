<template>
    <b-card
    :img-src="this.imgSrc"
    :img-alt="this.imgSrc"
    img-top
    class="book-card">
      <b-link class="book-card-link" :to="'/book/'+this.slug"></b-link>
      <b-card-text class="text-center" v-html="this.title">{{ title }}</b-card-text>

    </b-card>
</template>
<script>

export default {
  name: 'BookCard',
  props:["imgSrc", "imgAlt", "slug", "title"],
  data () {
    return {
    }
  },
  mounted(){

  },
  methods: {


  }
}
</script>
