// ProfessionalRegistration.vue
export default {
    template: `
    <div class="d-flex justify-content-center align-items-center" :style="containerStyle">
    <form @submit.prevent="submitPRegistration" class="w-26">
      <div :style="formStyle" class="bg-light border rounded shadow-sm">
        <h3 class="text-center mb-3">New Professional SignUp!</h3>
        <div class="text-danger text-center mb-2">{{error}}</div>
        
        <div class="mb-2">
          <label for="p_username" class="form-label">Username</label>
          <input id="p_username" type="text" placeholder="User Name" v-model="username" class="form-control"/>
        </div>
        
        <div class="mb-2">
          <label for="p_email" class="form-label">Email</label>
          <input id="p_email" type="email" placeholder="Email" v-model="email" class="form-control"/>
        </div>
        
        <div class="mb-2">
          <label for="p_password" class="form-label">Password</label>
          <input id="p_password" type="password" placeholder="Password" v-model="password" class="form-control"/>
        </div>
        
        <div class="mb-2">
          <label for="p_exp" class="form-label">Professional Experience</label>
          <input id="p_exp" type="text" placeholder="Year of Experience" v-model="professional_experience" class="form-control"/>
        </div>

        <div class="mb-2">
          <label for="service_type" class="form-label">Service Type</label>
          <select id="service_type" v-model="serviceType" class="form-control">
            <option value="" disabled>Select a service type</option>
            <option v-for="service in services" :key="service.id" :value="service.id">
                {{ service.name }}
            </option>
            </select>
          </div>

        <div class="mb-2">
          <label for="desc" class="form-label">Description</label>
          <input id="desc" type="text" placeholder="Describe your service" v-model="description" class="form-control"/>
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
        <button type="submit" class="btn btn-primary w-100 mt-3" >Register</button>
    </div>
  </form>
  </div>  
    `,
    data() {
      return {
        email: null,
        password: null,
        username:null,
        professional_experience: null,
        serviceType: null,
        description: null,
        selectedLocation:null,
        error: null,
        services: [],
        locations: [],
              // Style Objects
        containerStyle: {
              height: 'auto',
              backgroundImage: 'url("/static/assets/Home_Buddy.jpeg")', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              backgroundRepeat: 'no-repeat', 
              },
        formStyle: {
                padding: '2rem', 
                borderRadius: '10px', 
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
              },
      };            
    },


    methods: {

      async fetchServices() {
        const res = await fetch(`${location.origin}/api/add_service`);   //route addd_service with method get to display all available services
        const data = await res.json();
        if (res.ok) {
          this.services = data; 
        } else {
          alert(data.message);
        }
      },

      async fetchLocations() {
        const res = await fetch(`${location.origin}/api/locations`);
        const data = await res.json();
        if (res.ok) {
          this.locations = data; 
        } else {
          alert(data.message);
        }
      },

      async submitPRegistration() {
        // Input validation
        if (!this.email || !this.password || !this.professional_experience || !this.serviceType || !this.selectedLocation) {
          this.error = 'All fields are required';;
          return;
        }
          const res = await fetch(`/register/professional`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
              username:this.username,
              professional_experience: this.professional_experience,
              location_id:this.selectedLocation,
              service_id: this.serviceType,
              description: this.description,
              
            }),
          });
  
          const data = await res.json();
  
          if (res.ok) {
            alert(data.message);
            this.$router.push({ path: '/u_login' }); // Redirect to professional dashboard
          } else {
            alert(data.message);
          }
        } 
        
      },

      async mounted() {
        
        await this.fetchLocations();
        await this.fetchServices();
      },
    
  };
  