import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loading: false,
    isBook: false,
    showConfig: false,
    bookIndex: null,
    config: {
      book: { fontSize: null }
    }
  },
  mutations: {
    setLoading(state){
      state.loading = true
    },
    setNotLoading(state){
      // state.loadingObj.dismiss();
      // state.loadingObj = null;
      state.loading = false;

    },
    setIsBook(state, isOn){
      state.isBook = isOn;
    },
    setShowConfig(state, isOn){
      state.showConfig = isOn;
    },
    setBookIndex(state, indexHtml){
      state.bookIndex = indexHtml;
    }
  },
  getters:{
    isLoading: state => state.loading,
    isBook: state => state.isBook,
  },
  actions: {
  },
  modules: {
  }
})
