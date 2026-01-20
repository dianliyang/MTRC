import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminView from '../views/AdminView.vue'
import GatheringsView from '../views/GatheringsView.vue'
import MeetingDetailView from '../views/MeetingDetailView.vue'
import LibraryView from '../views/LibraryView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/library',
      name: 'library',
      component: LibraryView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true }
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

router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'admin' });
  } else {
    next();
  }
});

export default router
