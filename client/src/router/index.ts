import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'
import GatheringsView from '../views/GatheringsView.vue'
import MeetingDetailView from '../views/MeetingDetailView.vue'
import LibraryView from '../views/LibraryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/library',
      name: 'library',
      component: LibraryView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
    {
      path: '/gatherings',
      name: 'gatherings',
      component: GatheringsView
    },
    {
      path: '/gatherings/:id',
      name: 'meeting-detail',
      component: MeetingDetailView
    }
  ]
})

export default router
