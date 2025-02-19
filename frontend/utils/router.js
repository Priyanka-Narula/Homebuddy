const Home = {
    template: `<div 
    style="
        background: url('/static/assets/Home_Buddy.jpeg') no-repeat center center fixed;
        background-size: contain;
        height: 90vh;
        width: 90vw;
        margin: 0;
        padding: 0;
    ">
</div>` 
}

import LoginPage from "../pages/LoginPage.js"
import UserDash  from "../pages/UserDash.js"
import ProfDash from "../pages/ProfDash.js"
import AdminDash from "../pages/AdminDash.js"
import AddService from "../pages/AddService.js"
import UsersInfo from "../pages/UsersInfo.js"
import CustomerRegister from "../pages/CustomerRegister.js"
import ProfRegister from "../pages/ProfRegister.js"
import UserServiceHistory from "../pages/UserServiceHistory.js"
import UsersProfile from "../pages/UserProfile.js"
import AdminProfile from "../pages/AdminProfile.js"
import ProfProfile from "../pages/ProfProfile.js"
import Stats from "../pages/Stats.js"
import ViewRequest from "../pages/ViewRequest.js"


const routes = [
    { path: '/', component: Home,name: 'Home' },
    { path: '/u_login', component: LoginPage , name:'Login'}, 
    { path: '/register', component: Home ,name:'Register'},
    { path: '/register_customer', component:CustomerRegister ,name:'C_Register'},
    { path: '/register_professional', component:ProfRegister ,name:'P_Register'},
    { path: '/user_dash', component: UserDash },
    { path: '/prof_dash', component: ProfDash },
    { path: '/service_history', component: UserServiceHistory },
    { path: '/admin_dash', component: AdminDash },
    { path: '/addservice', component: AddService },
    { path: '/admin_stats', component: Stats },
    { path: '/users_info', component: UsersInfo },
    { path: '/user_profile', component: UsersProfile },
    { path: '/admin_profile', component: AdminProfile },
    { path: '/prof_profile', component: ProfProfile },
    { path: '/viewrequest', component: ViewRequest }
]

const router = new VueRouter({
    routes
})


export default router;
