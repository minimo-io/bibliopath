<template>
  <div>
    <div v-if="authorLoadedOk">
      <b-card class="mt-4">
    			<div class="container px-0">
            <div class="row">
        				<div class="col-md-4">
        						<center>
        							<b-img rounded="circle" width="180px" :src="author.avatar" alt=""></b-img>
        						</center>
        				</div>
        				<div class="col-md-7">
        					<div class="author-title text-center text-sm-left font-weight-bold">
                    {{ author.name }}
                  </div>
                  <div class="author-origin text-center text-sm-left">
                    From
                    <b-avatar class="no-shadow mr-1" size="1.2rem" :src="require('@/assets/flags/svg/'+author.countryCode+'.svg')"></b-avatar>USA
                  </div>

        					<div class="author-desc text-center text-sm-left">
                    <p>{{ author.description }}(<b-link href="#info-tab">+More</b-link>).</p>
                  </div>

        					<div class="product-rating mt-3 mb-3 text-center text-sm-left">
                    <i class="fa fa-star gold"></i>
                    <i class="fa fa-star gold"></i>
                    <i class="fa fa-star gold"></i>
                    <i class="fa fa-star"></i>
                    <i class="fa fa-star"></i>
                  </div>
                  <!-- <div class="beer-signature text-center text-sm-left">
                    Por
                    <b-link class="brewerylink text-uppercase font-weight-bold" :to="lg_build_path('/brewery/' + beer.brewery.brewerySlug)">
                      <b-avatar class="no-shadow" :src="beer.brewery.breweryLogo"></b-avatar>
                      {{ beer.brewery.breweryName }}
                    </b-link>
                  </div> -->
        					<!-- <div class="product-stock">In Stock</div> -->
        					<!-- <hr> -->
                  <b-button size="sm" variant="outline-danger" class="btn-sm-block mr-3">
                    <i class="far fa-heart mr-2"></i>Follow
                    <b-badge pill variant="danger">28</b-badge>
                  </b-button>
                  <b-button disabled size="sm" variant="outline-dark" class="btn-sm-block mt-3 mt-sm-0 mr-3">
                    <i class="fas fa-coins mr-2"></i>Support
                    <b-badge pill variant="dark">0</b-badge>
                  </b-button>
                  <b-button size="sm" variant="outline-success" class="btn-sm-block mt-3 mt-sm-0">
                    <i class="fas fa-book mr-2"></i>Read <b-badge variant="success">22</b-badge>
                  </b-button>
        				</div>
            </div>
          </div>
        <!-- </div> -->
      </b-card>

      <!-- <b-carousel
        id="carousel-fade"
        style="text-shadow: 0px 0px 2px #000"
        fade
        indicators
        img-width="1024"
        img-height="480"
        class="mt-3"
      >
        <b-carousel-slide
          caption="First slide"
          img-src="https://picsum.photos/1024/480/?image=10"
        ></b-carousel-slide>
        <b-carousel-slide
          caption="Second Slide"
          img-src="https://picsum.photos/1024/480/?image=12"
        ></b-carousel-slide>
        <b-carousel-slide
          caption="Third Slide"
          img-src="https://picsum.photos/1024/480/?image=22"
        ></b-carousel-slide>
      </b-carousel> -->

      <b-card class="mt-3">
        <b-card-title>Books <b-badge variant="primary softer">22</b-badge></b-card-title>
        <b-card-text>
          <b-card-group deck>
              <book-card
                v-for="book in author.books"
                v-bind="author"
                :key="book.id"
                :imgSrc="book.acf.book_cover.sizes.large"
                :imgAlt="book.acf.book_cover.alt"
                :title="book.title.rendered"
                :slug="book.slug"
                >
              </book-card>

              <!-- <b-card
              v-for="book in author.books"
              v-bind="author"
              :key="book.id"
              :img-src="book.acf.book_cover.sizes.large"
              :img-alt="book.acf.book_cover.alt"
              img-top
              class="book-card">
                <b-link class="book-card-link" :to="'/book/'+book.slug"></b-link>
                <b-card-text class="text-center" v-html="book.title.rendered"></b-card-text>

              </b-card> -->
            </b-card-group>

        </b-card-text>
      </b-card>

      <b-card class="mt-3">
        <b-card-title>Followers <b-badge variant="primary softer">285</b-badge></b-card-title>
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

      <div class="mt-3">
        <!-- TABS -->
        <div class="container-fluid px-0">


          <b-card no-body>
            <b-tabs class="beer-tabs" card>
              <b-tab id="info-tab" title="INFO" active>
                <b-card-text>
                  <section class="product-info mt-0 p-0 p-sm-3">

                    The Corsair Gaming Series GS600 power supply is the ideal price-performance solution for building or upgrading a Gaming PC. A single +12V rail provides up to 48A of reliable, continuous power for multi-core gaming PCs with multiple graphics cards. The ultra-quiet, dual ball-bearing fan automatically adjusts its speed according to temperature, so it will never intrude on your music and games. Blue LEDs bathe the transparent fan blades in a cool glow. Not feeling blue? You can turn off the lighting with the press of a button.
                    <br><br>
                    <h3>Corsair Gaming Series GS600 Features:</h3>
                    <li>It supports the latest ATX12V v2.3 standard and is backward compatible with ATX12V 2.2 and ATX12V 2.01 systems</li>
                    <li>An ultra-quiet 140mm double ball-bearing fan delivers great airflow at an very low noise level by varying fan speed in response to temperature</li>
                    <li>80Plus certified to deliver 80% efficiency or higher at normal load conditions (20% to 100% load)</li>
                    <li>0.99 Active Power Factor Correction provides clean and reliable power</li>
                    <li>Universal AC input from 90~264V — no more hassle of flipping that tiny red switch to select the voltage input!</li>
                    <li>Extra long fully-sleeved cables support full tower chassis</li>
                    <li>A three year warranty and lifetime access to Corsair’s legendary technical support and customer service</li>
                    <li>Over Current/Voltage/Power Protection, Under Voltage Protection and Short Circuit Protection provide complete component safety</li>
                    <li>Dimensions: 150mm(W) x 86mm(H) x 160mm(L)</li>
                    <li>MTBF: 100,000 hours</li>
                    <li>Safety Approvals: UL, CUL, CE, CB, FCC Class B, TÜV, CCC, C-tick</li>
                  </section>

                </b-card-text>
              </b-tab>
              <b-tab title="RESEÑAS" disabled>
                <b-card-text>
                  <section class="product-info mt-0 p-0 p-sm-3">

                  </section>
                </b-card-text>
              </b-tab>
            </b-tabs>
          </b-card>

        </div>

      </div>


    </div>

  </div>
</template>
<style scoped>

</style>
<script>
  import axios from 'axios'
  import bookCard from '@/components/BookCard'
  export default{
    name: "Author",
    components:{ "book-card": bookCard},
    data(){
      return {
        authorLoadedOk: false,
        author: {
          id: null,
          slug: this.$route.params.slug,
          name: null,
          description: null,
          avatar: null,
          countryCode: 'un',
          books: []
        }
      }
    },
    mounted(){
      this.$store.commit("setLoading");
      axios.get(this.$appDetails.appAPIUri + "/wp-json/wp/v2/users/?slug="+ this.author.slug +"&_embed").then((result) => {
        console.log( result.data[0].acf.author_avatar );
        this.$store.commit("setNotLoading");
        this.author.id = result.data[0].id;
        this.author.name = result.data[0].name;
        this.author.description = result.data[0].description;
        this.author.avatar = result.data[0].acf.author_avatar;
        this.author.countryCode = result.data[0].acf.author_country_code;
        this.authorLoadedOk = true;

        // this.book.title = result.data[0].title.rendered;
        // this.book.author.name = result.data[0]._embedded.author[0].name;
        // this.book.author.slug = result.data[0]._embedded.author[0].slug;
        // this.book.author.avatar = result.data[0]._embedded.author[0].avatar_urls[48];
        //this.book.presentation = result.data[0]._embedded["wp:featuredmedia"][0].source_url;
        this.$store.commit("setLoading");
        axios.get(this.$appDetails.appAPIUri + "/wp-json/wp/v2/posts/?author="+ this.author.id +"&_embed").then((result) => {

          this.$store.commit("setNotLoading");
          console.log(result.data);
          this.author.books = result.data;




        });


      });
    }
  }
</script>
