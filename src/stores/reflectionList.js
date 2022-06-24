import { defineStore } from 'pinia'

export const useReflectionListStore = defineStore('reflectionList', {
  state: () => ({
    filter: {
      search: '',
      showAbstracted: 'All',
    },
  }),

  getters: {
    // doubleCount(state) {
    //   return state.reflectionList * 2
    // },
  },

  actions: {
    // increment() {
    //   this.reflectionList++
    // },
  },
})
