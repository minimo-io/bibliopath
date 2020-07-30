<template>
  <div>
    <header class="alt-header alt-header--top" :class="{ 'alt-fixed-top': hasScrolled }">
      <div class="alt-container alt-header__container">
        <!-- left nav -->
        <nav class="alt-header__left">
          <h1 class="app-logo zoom" title="Bibliopath" itemprop="name headline">
            <b-link :to="{ path: '/' }">
              <b-spinner v-if="isLoading" type="grow" label="Loading..." small></b-spinner>
              <i v-else class="fas fa-bookmark"></i>
              BIBLIOPATH
            </b-link>

          </h1>
        </nav>

        <!-- right nav -->
        <nav class="alt-header__right">

          <a class="alt-header__left__menu-trigger" v-b-toggle.sidebar-1 role="button" aria-expanded="true">
            MENU
          </a>

          <span class="alt-header__separator alt-separator d-none d-sm-inline-block">/</span>
          <div class="alt-header__user alt-header__user--anonymous d-none d-sm-inline-block">
            <div class="alt-user-nav">
              <b-link v-if="user.loggedIn" title="OUT" class="alt-header__sign-in">OUT</b-link>
              <b-link v-else :to="{ path: '/login' }" title="Signin" class="alt-header__sign-in">Signin</b-link>

            </div>
          </div>

          <span class="alt-header__separator alt-separator">/</span>

          <b-link href="#"><i class="fas fa-search"></i></b-link>

          <span class="alt-header__separator alt-separator">/</span>

          <b-link :to="{ path: '/store' }" title="STORE" class="alt-header__sign-in"><i class="fas fa-cog"></i></b-link>

          <span v-if="showIndex" class="alt-header__separator alt-separator">/</span>

          <a v-if="showIndex" v-b-toggle.sidebar-index role="button" title="BOOK MENU" class="alt-header__sign-in"><i class="fas fa-bars"></i></a>

          <!-- <b-nav class="navbar-nav navbar-main ml-auto order-1 d-none d-sm-inline-block">
            <b-nav-item-dropdown
                  toggle-class="nav-link-custom"
                >
                  <b-dropdown-item>ES</b-dropdown-item>
              </b-nav-item-dropdown>
          </b-nav> -->



        </nav>
      </div>
    </header>

    <!-- Sidebar -->
    <b-sidebar id="sidebar-1" title="BIBLIOPATH" lazy backdrop shadow>


      <div class="px-3 py-2 mt-2">

        <b-button v-if="user.loggedIn"  block variant="outline-secondary" size="sm" class="mb-1">OUT</b-button>
        <b-button v-else :to="{ path: '/login' }" block variant="outline-secondary" size="sm" class="mb-1">SIGNIN</b-button>

        <!-- <h2>Essential Links</h2> -->
        <ul class="mt-2">
          <li><b-link :to="{ path: '/' }"><i class="fas fa-home mr-1"></i>Home</b-link></li>
          <!-- <li><b-link :to="{ path: lg_build_path('/store') }"><i class="fas fa-shopping-cart mr-1"></i>{{ $t('nav.store.title') }}</b-link></li> -->
          <!-- <li><b-link :to="{ path: lg_build_path('/school') }"><i class="fab fa-leanpub mr-1"></i>{{ $t('nav.school.title') }}</b-link></li> -->
          <!-- <li><b-link :to="{ path: lg_build_path('/news') }"><i class="fas fa-newspaper mr-1"></i>{{ $t('nav.news.title') }}</b-link></li> -->
        </ul>

      </div>
    </b-sidebar>
    <!-- Index -->
    <b-sidebar id="sidebar-index" title="CHAPTERS" lazy backdrop shadow>

      <div class="px-3 py-2 mt-0 pt-0">


        <ul class="book-menu-main nav section-nav flex-column mb-4" v-html="bookIndex"></ul>


      </div>
    </b-sidebar>
  </div>
</template>

<script>
export default{
  data(){
    return {
      hasScrolled : false,
      user:{
        loggedIn: false
      },
      isLoading: true,
      showIndex: false,
      bookIndex: null
    }
  },
  watch: {
    '$store.state.loading': function() {
      if (this.$store.state.loading){

        this.isLoading = true;

      }else{

        this.isLoading = false;
      }
    },
    '$store.state.isBook': function() {
      if (this.$store.state.isBook){
        this.showIndex = true;
      }else{
        this.showIndex = false;
      }
    },
    '$store.state.bookIndex': function() {
      if (this.$store.state.bookIndex){
        this.bookIndex = this.$store.state.bookIndex;
      }else{
        this.bookIndex = '';
      }
    },
  },
  created () {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll);
  },
  // computed: {
  //   ...mapGetters({
  //     // map `this.user` to `this.$store.getters.user`
  //     user: "user"
  //   })
  // },


  methods: {
    // language_name(lang_code){
    //   if (lang_code == "es") return "Español";
    //   if (lang_code == "en") return "English";
    // },
    handleScroll: function (event) {
      if (window.scrollY > 200) {
        this.hasScrolled = true;
      } else {
        this.hasScrolled = false;
      }
      // console.log(window.scrollY);

    },
    signOut() {

    }
  },
}
</script>
