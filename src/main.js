import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import store from './store'
import VueLazyload from 'vue-lazyload'
import { plugin as VueTippy } from 'vue-tippy'

// Importa todos os estoçps da aplicação
import "vue3-toastify/dist/index.css"
import '@jobinsjp/vue3-datepicker/index.css';
import 'tippy.js/dist/tippy.css' // optional for styling 

// Importe o CSS do Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'

// Importe o JS do Bootstrap (necessário para interações como modals, dropdowns, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js'   // bundle já inclui Popper

import "./styles.css";

const app = createApp(App)
app.use(router)
app.use(store)
app.use(
    VueTippy,
    // optional
    {
        directive: 'tippy', // => v-tippy
        component: 'tippy', // => <tippy/>
        componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
        defaultProps: {
            placement: 'auto-end',
            allowHTML: true,
        }, // => Global default options * see all props
    }
)
app.use(VueLazyload)
app.mount('#app')