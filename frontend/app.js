
// import Navbar from "./components/Navbar.js"
// import router from "./utils/router.js"
// //Navigation gaurds
// router.beforeEach((to, from, next) => {
//     const isAuthenticated = localStorage.getItem('auth_token');
//     if (
//         to.name !== 'Login' &&
//         to.name !== 'Home' &&
//         to.name !== 'Register' &&
//         to.name !== 'C_Register' &&
//         to.name !== 'P_Register' &&
//         !isAuthenticated
//     ) {
//         next({ name: 'Login' });
//     } else {
//         next();
//     }
// });



// const app = new Vue({
//     el : "#app" ,             /*tells the element to mount the vue- id of the element is #app*/
//                                   /*<router-view><-dynamic display of the data based on the page visited which component to dispaly on which route comes from router.js*/
//     router,
    
//     template :`
//     <div>
//         <Navbar/>
//         <router-view></router-view>          
//     </div>
//     `,
//     components : {
//         Navbar,
//     },
    
//     data() {
//         return {
//             changing_route: true,
//         };
//     },
//     watch: {
//         $route(to, from) {
//             this.changing_route = !this.changing_route;
//         },
//     },
// });

import Navbar from "./components/Navbar.js";  // Correct import path
import router from "./utils/router.js";

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('auth_token');
    if (
        to.name !== 'Login' &&
        to.name !== 'Home' &&
        to.name !== 'Register' &&
        to.name !== 'C_Register' &&
        to.name !== 'P_Register' &&
        !isAuthenticated
    ) {
        next({ name: 'Login' });
    } else {
        next();
    }
});

const app = new Vue({
    el: "#app",    // Make sure the id matches the div in your index.html
    router,
    template: `
        <div>
            <Navbar :key="changing_route" />  <!-- Key to force re-render on route change -->
            <router-view></router-view>       <!-- View for dynamic route content -->
        </div>
    `,
    components: {
        Navbar,  // Register the Navbar component here
    },
    data() {
        return {
            changing_route: true,
        };
    },
    watch: {
        $route(to, from) {
            this.changing_route = !this.changing_route;
        },
    },
});

