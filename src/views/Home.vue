<template>
  <div>
    <div class="align-items-center mb-4 mt-5">

      <div class="welcome-box col-lg-12 text-center text-lg-left order-lg-1 px-0">


        <b-card no-body class="p-0 pt-0 mt-0" style="border:0;">

          <div class="overlay overlay-dark"></div>

          <b-card-body class="welcome-box-cover z-index-6000 text-center p-5">
          <center>
            <h2 class="hero-h1 mt-0 mt-2 mb-4 mb-md-4 bd-text-purple-bright display-4">
              The Open Editorial
            </h2>

            <div class="row">
                <div class="col-md-4 mb-3 welcome-image-box">

                      <b-img :src="require('@/assets/bibliopath-white.png')" fluid alt="bienvenido-a-hopmasters" class="mt-0 mb-0 animated flip"></b-img>

                </div>
                <div class="col-md-7 mt-2">

                    <h3 class="post-subtitle">
                      Bibliopath is an editorial project promoting Open reading & Open publishing.
                      <span class='d-none d-lg-inline-block'>If you are a visitor read, listen & discuss based on Open Standards.
                      If you are an author <b-link target="_blank" href="#"><span class="text-nowrap"><i class="fas fa-upload mr-1"></i>Publish for free</span></b-link> and get some <b-link to="#"><i class="fas fa-hand-holding-usd"></i></b-link> and <b-link to="#"><i class='fas fa-heart'></i></b-link> from your followers.</span>
                    </h3>


                    <div class="container px-0 mt-4 mb-0 text-left">
                      <b-button size="md" variant="danger" class="btn-sm-block mr-3">
                        <i class="fas fa-book mr-1"></i>Books
                        <b-badge pill variant="danger">{{ resultBookCount }}</b-badge>
                      </b-button>
                      <b-button size="md" variant="dark" class="btn-sm-block mt-3 mt-sm-0 mr-3">
                        <i class="fas fa-user-edit mr-1"></i>Authors
                        <!-- <b-badge pill variant="dark">23</b-badge> -->
                      </b-button>
                      <b-button size="md" variant="success" class="btn-sm-block mt-3 mt-sm-0">
                        <i class="fas fa-volume-up mr-1"></i>Audiobooks
                        <!-- <b-badge pill variant="success">4</b-badge> -->
                      </b-button>
                    </div>

                </div>

            </div>





          </center>
          </b-card-body>
        </b-card>


      </div>
    </div>

    <div class="container">
      <h2 class="mb-2" style="font-size:1.5rem;">Books</h2>
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
  </div>
</template>
<script>
import axios from "axios";
import BookCard from "@/components/BookCard";

export default {
  name: 'Home',
  components: {
    "book-card": BookCard
  },
  data(){
    return {
      books: []
    }
  },
  computed: {
    resultBookCount () {
      return this.books && this.books.length;
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
