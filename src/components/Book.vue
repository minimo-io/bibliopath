<template>
    <ion-content>
      <ion-grid fixed>
          <ion-button id="prev" size="small" expand="block" color="light" @click="prevPage()">Previous</ion-button>
          <div id="book-area"></div>
          <ion-button id="next" size="small" expand="block" color="light" @click="nextPage()">Next</ion-button>

        </ion-grid>
    </ion-content>
</template>
<style scoped>
  #book-area{
    margin:auto;
    max-width:700px;
  }
  /* .epub-container {
    min-width: 320px;
    margin: 0 auto;
    position: relative;
  }

  .epub-container .epub-view > iframe {
      background: white;
      box-shadow: 0 0 4px #ccc;
  } */
</style>
<script>
import ePub from 'epubjs';
export default {
  name: 'Book',
  data () {
    return {
      rendition: null
      // slug:this.$route.params.slug_brewery,
    }
  },
  created(){
    this.loadBook("https://minimo.io/ebook.epub");
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


      book.ready.then(() => {

          console.log("Book ready");

      })


    }
  }
}
</script>
