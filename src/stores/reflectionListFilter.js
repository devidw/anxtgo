import { defineStore } from 'pinia'

export const useReflectionListFilterStore = defineStore(
  'reflectionListFilter',
  {
    state: () => ({
      filter: {
        search: '',
        showAbstracted: 'All',
      },
    }),

    getters: {
      // doubleCount(state) {
      //   return state.reflectionListFilter * 2
      // },
    },

    actions: {
      // increment() {
      //   this.reflectionListFilter++
      // },
    },
  }
)
