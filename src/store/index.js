import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loading: false,
    loadingObj : null
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
    setLoadingObj(state, o){
      state.loadingObj = o;
    }
  },
  getters:{
    isLoading: state => state.loading,
    getLoadingObj: state => state.loadingObj
  },
  actions: {
  },
  modules: {
  }
})
