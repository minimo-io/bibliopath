<template>
    <ion-content>
      <ion-grid fixed>
        <span
          v-on:keyup.left="prevPage"
          v-on:keyup.right="nextPage"
          >
          <!-- <ion-button id="prev" size="small" expand="block" color="light" @click="prevPage()">Previous</ion-button> -->
          <div id="book-area"></div>
          <!-- <ion-button id="next" size="small" expand="block" color="light" @click="nextPage()">Next</ion-button> -->
        </span>
        </ion-grid>
    </ion-content>
</template>
<style scoped>
  #book-area{
    margin:auto;
    max-width:700px;
  }
</style>
<script>
import ePub from 'epubjs';
import Firebase from '@/firebase'

export default {
  name: 'Book',
  data () {
    return {
      rendition: null,
      bookSlug: this.$route.params.slug
    }
  },
  mounted(){
    let booksRef = Firebase.database().ref("books");
    let o_book = this;
    let o_store = this.$store;
    this.$store.commit("setLoading"); // app loading something
    booksRef.orderByChild('slug').equalTo(this.bookSlug).limitToLast(1).on("value", function(snapshot) {
      snapshot.forEach(function(data) {
        let bookData = data.val();
        if (bookData){
          let book = "https://minimo.io/epubs/" + bookData.book;
          o_book.loadBook(book);
        }

      });
    });


  },
  methods: {
    nextPage(){
      this.rendition.next();
      document.querySelector('ion-content').scrollToTop(500);
    },
    prevPage(){
      this.rendition.prev();
      document.querySelector('ion-content').scrollToTop(500);
    },
    loadBook: function(bookname){
      // let ebook = require("@/assets/books/"+bookname);
      let ebook = bookname;
      var book = ePub(ebook, {});
      var rendition = book.renderTo("book-area", {
        // manager: "continuous",
        // flow: "scrolled",
        // spread: "always",
        width: "100%",
      });
      this.rendition = rendition;
      rendition.display();

      rendition.on("rendered", function(section){
        var nextSection = section.next();
        var prevSection = section.prev();

        if(nextSection) {

          var nextNav = book.navigation.get(nextSection.href);
          if(nextNav) {
            var nextLabel = nextNav.label;
          } else {
            var nextLabel = "next";
          }

          next.textContent = nextLabel + " »";
        } else {
          next.textContent = "";
        }

        if(prevSection) {
          var prevNav = book.navigation.get(prevSection.href);

          if(prevNav) {
            var prevLabel = prevNav.label;
          } else {
            var prevLabel = "previous";
          }

          prev.textContent = "« " + prevLabel;
        } else {
          prev.textContent = "previous";
        }

      });


      // Load gestures for swiping
      rendition.hooks.content.register(function(contents){
        var script = document.createElement('script');
        script.onload = function() {
            var scriptTouch = document.createElement('script');
            scriptTouch.type = 'text/javascript';
            scriptTouch.src = '/js/jquery.detect_swipe.min.js';
            document.head.appendChild(scriptTouch);

            scriptTouch.onload = function(){

              (function($){


                $("#book-area iframe").contents().on("swipeleft", function(){
                    rendition.next();
                });
                $("#book-area iframe").contents().on("swiperight", function(){
                    rendition.prev();
                });



               })(jQuery);


            }
        };
        script.type = 'text/javascript';
        // script.src = 'https://code.jquery.com/jquery-2.1.4.min.js';
        // script.src = require('@/assets/js/jquery.min.js');
        script.src = '/js/jquery.min.js';
        document.head.appendChild(script);



      });

      book.ready.then(() => {




        this.$store.commit("setNotLoading"); // app loading something
        // console.log("Book ready!");


      })


    },
    swipeHandlerLeft(){
      this.rendition.next();

      console.log("Swipe left");

    },
    swipeHandlerRight(){
      this.rendition.prev();

      console.log("Swipe right");

    }
  }
}
</script>
