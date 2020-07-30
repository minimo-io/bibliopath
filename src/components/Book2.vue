<template>
  <div v-if="content">
    <b-card class="pb-3 pt-0 pb-md-5 pt-md-3 mb-4 mb-sm-0"
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
        <div v-if="book.aff.link" class="book-buy text-center">
          <!-- <a rel="noreferrer noopener" href="https://m.do.co/c/5deb27a66131" class="" target="_blank"><strong>Digitalocean</strong></a> -->
          <b-link :href="book.aff.link" target="_blank" class="alt-aff-link softer">
            <i class="fab fa-amazon mr-1"></i>Comprar libro de bolsillo</b-link>
        </div>
      </b-card-body>
      <div class="overlay overlay-dark"></div>

    </b-card>
    <b-card class="mt-3" v-if="showInfo">
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

    <div class="book-box mt-2">
      <nav aria-label="Index navigation" :class="{ 'd-lg-block': showIndex }" class="d-none pl-4 pt-3 mx-0">
        <h2>CHAPTERS <a @click.prevent="toggleIndex" class="pointer">(Hide)</a></h2>
        <ul class="book-menu nav section-nav flex-column"></ul>
      </nav>
      <div v-html="content" :class="{ 'padding-right-inherit': !showIndex }" class="book-content"></div>

    </div>

  </div>
</template>
<script lang="ts">
  import axios from "axios"

  export default{
    data(){
      return {
        isBookLoaded: false,
        content: null,
        showIndex: true,
        showInfo: false,
        indexHtml: null,
        book: {
          slug: this.$route.params.slug,
          title: null,
          author: { name: null, slug: null, avatar: null },
          // content: null,
          presentation: null,
          modified: null,
          license: null,
          aff: {
            link: null
          },
          menu: null
        }
      }
    },
    watch: {
      content: function (val) {
        if(val){
          this.$nextTick(()=>{
            //$(".book-menu").empty();

                $(document).on('click', 'a[href^="#"]', function (event) {

                    var hash_val = $.attr(this, 'href');
                    if (hash_val == "#") return;

                    $('html, body').animate({
                        scrollTop: $(hash_val).offset().top - 80
                    }, 500);
                    // event.preventDefault();
                });
                // $(window).bind('scroll', function () {
                //   if ($(window).scrollTop() > $(".book-box nav").offset().top) {
                //
                //   } else {
                //
                //   }
                // });
                // $('.back-to-the-future').click(function() {
                //     $("html, body").animate({
                //         scrollTop: 0
                //     }, 600);
                //     return false;
                // });

              $(".book-content h2, .book-content h3").each(function( key, value ) {
                $(value).attr("id", "title-"+key);
                var elemClass = "is-h2";
                if ($(value).is("h3")) elemClass = "is-h3";
                // $(this).attr("id", "title-"+key );
                let txt2 = $("<a href='#title-"+key +"' class='nav-link mt-1 mb-0 px-0 pt-0 pb-0 "+ elemClass +"'></a>").append($(value).text());
                let txt1 = $("<li class='nav-item mb-0'></li>").append(txt2);

                $(".book-menu").append(txt1);


              });
              this.indexHtml = $(".book-menu").html();
              this.$store.commit("setBookIndex", this.indexHtml );


          })
        }
      },
    },
    mounted(){
      this.$store.commit("setIsBook", true);
      this.$store.commit("setLoading");
      axios.get(this.$appDetails.appAPIUri + "/wp-json/wp/v2/posts?slug="+ this.book.slug +"&_embed").then((result) => {
         console.log(result.data[0].acf.book_license);
        this.$store.commit("setNotLoading");

        this.content = result.data[0].content.rendered;
        // this.book = result.data[0];
        this.book.title = result.data[0].title.rendered;
        this.book.modified = result.data[0].modified;
        this.book.license = result.data[0].acf.book_license;
        this.book.aff.link = result.data[0].acf.book_aff_link;
        this.book.author.name = result.data[0]._embedded.author[0].name;
        this.book.author.slug = result.data[0]._embedded.author[0].slug;
        this.book.author.avatar = result.data[0]._embedded.author[0].acf.author_avatar;
        //this.book.presentation = result.data[0]._embedded["wp:featuredmedia"][0].source_url;



      });
    },
    update(){
      this.$store.commit("setIsBook", true);
    },
    methods:{
      toggleIndex(){
        this.showIndex = false;


      }
    }

  }
</script>
