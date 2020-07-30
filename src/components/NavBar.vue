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

          <a @click.prevent="toggleConfig(true);" role="button" class="alt-header__sign-in"><i class="fas fa-cog"></i></a>

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

    <!-- Config menu -->
    <div id="fullscreen-menu" v-if="showConfig" class="pulse animated extrafast">
      <div class="menu-inner">


          <div class="menu-nav">
              <b-card title="Font size" style="max-width:50%;margin:auto;">
                <b-form-radio-group
                   v-model="selectedFont"
                   :options="optionsFonts"
                   class="mb-3"
                   value-field="item"
                   text-field="name"
                   disabled-field="notEnabled"
                 ></b-form-radio-group>
              </b-card>

              <b-card class="mt-2" title="Configuration" style="max-width:50%;margin:auto;">
                <b-form-group label="Inline switch style checkboxes">
                   <b-form-checkbox-group
                     v-model="selected"
                     :options="options"
                     switches
                   ></b-form-checkbox-group>
                 </b-form-group>

               </b-card>
          </div>


      </div>
    </div>

  </div>
</template>

<script>
export default{
  data(){
    return {
      selected: [], // Must be an array reference!
      options: [
        { text: 'Red', value: 'red' },
        { text: 'Green', value: 'green' },
        { text: 'Yellow (disabled)', value: 'yellow', disabled: true },
        { text: 'Blue', value: 'blue' }
      ],
      selectedFont: 'A',
      optionsFonts: [
        { item: 'A', name: 'Option A' },
        { item: 'B', name: 'Option B' },
        { item: 'D', name: 'Option C', notEnabled: true },
        { item: { d: 1 }, name: 'Option D' }
      ],
      hasScrolled : false,
      user:{
        loggedIn: false
      },
      isLoading: true,
      showIndex: false,
      bookIndex: null,
      showConfig: false
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
    '$store.state.showConfig': function() {
      if (this.$store.state.showConfig){
        this.showConfig = true;
      }else{
        this.showConfig = false;
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
    toggleConfig(b){
      this.$store.commit('setShowConfig', b);
    },
    signOut() {

    }
  },
}
</script>
