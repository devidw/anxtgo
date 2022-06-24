import { defineStore } from 'pinia'

export const useAbstractionListStore = defineStore('abstractionList', {
  state: () => ({
    search: '',
  }),

  getters: {
    // doubleCount(state) {
    //   return state.abstractionList * 2
    // },
  },

  actions: {
    // increment() {
    //   this.abstractionList++
    // },
  },
})
