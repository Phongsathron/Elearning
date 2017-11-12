require('./bootstrap');

import Vue from 'vue'
import router from './routes.js'
import App from './App.vue'
import axios from 'axios'
import Auth from './packages/auth/auth.js'
import VueClip from 'vue-clip'

Vue.use(Auth)
Vue.use(VueClip)

axios.defaults.baseURL = 'http://localhost/elearning/public';

Vue.prototype.$appName = "Elearning";
Vue.prototype.$role = "";

router.beforeEach(
    (to, from, next) => {
        if (typeof to.meta.role !== 'undefined') {
            if (Vue.auth.isAuth()) {
                axios.get('api/me', {
                    headers: {
                        Authorization: 'Bearer ' + Vue.auth.getToken()
                    }
                }).then(response => {
                    if (response.data.role.actions != to.meta.role) {
                        next({
                            path: '/'
                        })
                    } else {
                        next()
                    }
                })
            } else {
                next({
                    path: '/'
                })
            }
        }
        else if(to.matched.some(record => record.meta.forVisitors)){
            if(Vue.auth.isAuth()){
                next({
                    path: '/'
                })
            }else{
                return next()
            }
        }
        else if(to.matched.some(record => record.meta.forAuth)){
            if (!Vue.auth.isAuth()) {
                next({
                    path: '/login'
                })
            } else {
                return next()
            }
        }
        else{
            return next()
        }
    }
)

axios.get('api/me', {
    headers: {
        Authorization: 'Bearer ' + Vue.auth.getToken()
    }
}).then(response => {
    Vue.prototype.$role = response.data.role.actions
})

Vue.component('navbar', require('./components/NavbarComponent.vue'));

const app = new Vue({
    el: '#app',
    router,
    render: h => h(App)
});
