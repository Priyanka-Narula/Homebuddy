// CustomerRegistration.vue
export default {
        template: `  <div>
      
<div class="d-flex justify-content-center align-items-center" :style="containerStyle">
  <form @submit.prevent="submitRegistration" class="w-25">
    <div :style="formStyle" class="bg-light border rounded shadow-sm">
      <h3 class="text-center mb-3">New Customer SignUp!</h3>
      <div class="text-danger text-center mb-2">{{error}}</div>
      
      <div class="mb-2">
        <label for="c_username" class="form-label">Username</label>
        <input id="c_username" type="text" placeholder="User Name" v-model="username" class="form-control"/>
      </div>
      
      <div class="mb-2">
        <label for="c_email" class="form-label">Email</label>
        <input id="c_email" type="email" placeholder="Email" v-model="email" class="form-control"/>
      </div>
      
      <div class="mb-2">
        <label for="c_password" class="form-label">Password</label>
        <input id="c_password" type="password" placeholder="Password" v-model="password" class="form-control"/>
      </div>
      
      <div class="mb-2">
        <label for="c_address" class="form-label">Address</label>
        <input id="c_address" type="text" placeholder="Address" v-model="address" class="form-control"/>
      </div>
      <div class="mb-2">
        <label for="c_location" class="form-label">Location</label>
        <select id="c_location" v-model="selectedLocation" class="form-control">
        <option value="" disabled>Select a location</option>
        <option v-for="location in locations" :key="location.id" :value="location.id">
          {{ location.area }}
        </option>
        </select>
        </div>
      
      <div class="mb-2">
        <label for="c_contact" class="form-label">Preferred Contact</label>
        <input id="c_contact" type="text" placeholder="Preferred Contact" v-model="preferred_contact" class="form-control"/>
      </div>
      
      <button type="submit" class="btn btn-primary w-100 mt-3" >Register</button>
    </div>
  </form>
</div>
</div>
  `,
  data() {
    return {
      email: null,
      password: null,
      username: null,
      address: null,
      selectedLocation: null,
      preferred_contact: null,
      error: null,
      locations:[],
      // Style Objects
      containerStyle: {
        height: 'auto',
        backgroundImage: 'url("/static/assets/Home_Buddy.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        padding: '20px',
        },
      
      formStyle: {
        padding: '1.5rem',
        
      },
    };
  },
  methods: {

    async fetchLocations() {
      try {
        const res = await fetch(`/api/locations`);
        const data = await res.json();

        if (res.ok) {
          this.locations = data; // Populate the locations array
        } else {
          this.error = 'Failed to fetch locations.';
        }
      } catch (err) {
        this.error = 'Error fetching locations: ' + err.message;
      }
    },

    // Register new customer
    async submitRegistration() {
      
      if (!this.email || !this.password || !this.username || !this.address || !this.selectedLocation || !this.preferred_contact) {
        this.error = 'All fields must be filled out!';
        return;
      }
        const res = await fetch(`${location.origin}/register/customer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
            address: this.address,
            location_id: this.selectedLocation,
            preferred_contact: this.preferred_contact,
            username: this.username,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          alert(data.message);
          this.$router.push({ path: '/u_login' });
        } else {
          this.error = data.message; // Set the error message to be displayed
        }
      
    },
  },
  mounted() {
    
    this.fetchLocations();
  },
};
