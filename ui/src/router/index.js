import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import UserDetails from '../views/UserDetails.vue';
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/social',
        name: 'Social',
    },
    {
        path: '/game',
        name: 'Game',
        component: Home //Game
    },
    {
        path: '/profile/:username',
        name: 'profile',
        component: UserDetails,
        props: true
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
];
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});
export default router;
//# sourceMappingURL=index.js.map