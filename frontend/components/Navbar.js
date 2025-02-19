 
export default {
  template: `
    <nav class="navbar navbar-expand-lg" style="background-color: #333; color: white;"> <!-- Dark gray background -->
      <div class="container-fluid">
        <a class="navbar-brand" href="#" style="font-weight: bold; color: #FFD700;">HomeBuddy</a> <!-- Gold text for the brand -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <!-- Public routes for unauthenticated users -->
            <li class="nav-item" v-if="!is_loged_in">
              <router-link class="nav-link active" aria-current="page" to="/" style="color: #f8f9fa;">Home</router-link> <!-- Light text color -->
            </li>
            <li class="nav-item" v-if="!is_loged_in">
              <router-link class="nav-link active" to="/register_customer" style="color: #f8f9fa;">New Customer</router-link>
            </li>
            <li class="nav-item" v-if="!is_loged_in">
              <router-link class="nav-link active" to="/register_professional" style="color: #f8f9fa;">New Professional</router-link>
            </li>
            <li class="nav-item" v-if="!is_loged_in">
              <router-link class="nav-link active" to="/u_login" style="color: #f8f9fa;">Login</router-link>
            </li>

            <!-- Routes for authenticated customers -->
            <li class="nav-item" v-if="is_loged_in && role === 'customer'">
              <router-link class="nav-link active" to="/user_dash" style="color: #f8f9fa;">Dashboard</router-link>
            </li>
            
            <li class="nav-item" v-if="is_loged_in && role === 'customer'">
              <router-link class="nav-link active" to="/service_history" style="color: #f8f9fa;">Service History</router-link>
            </li>
            <li class="nav-item" v-if="is_loged_in && role === 'customer'">
              <router-link class="nav-link active" to="/user_profile" style="color: #f8f9fa;">Profile</router-link>
            </li>

            <!-- Routes for authenticated admin -->
            <li class="nav-item" v-if="role === 'admin'">
              <router-link class="nav-link active" to="/admin_dash" style="color: #f8f9fa;">Dashboard</router-link>
            </li>
            <li class="nav-item" v-if="role === 'admin'">
              <router-link class="nav-link active" to="/addservice" style="color: #f8f9fa;">Add Service</router-link>
            </li>
            <li class="nav-item" v-if="role === 'admin'">
              <router-link class="nav-link active" to="/viewrequest" style="color: #f8f9fa;">Ongoing Requests</router-link>
            </li>
            <li class="nav-item" v-if="is_loged_in && role === 'admin'">
              <router-link class="nav-link active" to="/users_info" style="color: #f8f9fa;">Users Info</router-link>
            </li>
            <li class="nav-item" v-if="is_loged_in && role === 'admin'">
              <router-link class="nav-link active" to="/admin_profile" style="color: #f8f9fa;">Profile</router-link>
            </li>
            <li class="nav-item" v-if="is_loged_in && role === 'admin'">
              <router-link class="nav-link active" to="/admin_stats" style="color: #f8f9fa;">Statistics</router-link>
            </li>
            <!-- Routes for professional --> 
            <li class="nav-item" v-if="role === 'professional'">
              <router-link class="nav-link active" to="/prof_dash" style="color: #f8f9fa;">Review Requests</router-link>
            </li>
            
            <li class="nav-item" v-if="is_loged_in && role === 'professional'">
              <router-link class="nav-link active" to="/prof_profile" style="color: #f8f9fa;">Profile</router-link>
            </li>
            
          </ul>

          <!-- Logout button at the far right -->
          <ul class="navbar-nav ms-auto">
            <li class="nav-item" v-if="is_loged_in">
              <button class="btn btn-danger" @click="logout" style="color: white;">Logout</button> <!-- White text on red button -->
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,

  data() {
    return {
      role: localStorage.getItem('role'),
      is_loged_in: localStorage.getItem('auth_token'),
      email: localStorage.getItem('email'),
    };
  },

  methods: {
    logout() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      this.$router.push({ path: '/' });  // Redirect to home after logout
    },
  },
};
