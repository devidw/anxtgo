import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '', redirect: { path: '/reflections' } },
      { path: 'reflections', component: () => import('src/pages/reflection/ReflectionListPage.vue'), },
      { path: 'reflections/add', component: () => import('src/pages/reflection/ReflectionAddOrEditPage.vue') },
      { path: 'reflections/:id/edit', component: () => import('src/pages/reflection/ReflectionAddOrEditPage.vue') },
      { path: 'abstractions', component: () => import('src/pages/abstraction/AbstractionListPage.vue') },
      { path: 'abstractions/:id', component: () => import('src/pages/abstraction/AbstractionDetailPage.vue') },
      { path: 'abstractions/add', component: () => import('src/pages/abstraction/AbstractionAddOrEditPage.vue') },
      { path: 'abstractions/:id/edit', component: () => import('src/pages/abstraction/AbstractionAddOrEditPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
