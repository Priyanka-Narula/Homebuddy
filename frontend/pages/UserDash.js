//Customer Dashboard

export default {
  template: `
    <div :style="containerStyle">
        <h1>Available Services</h1>
        
        <!-- service by name -->
        <div style="margin-bottom: 20px;">
          <input type="text" v-model="searchQuery" @input="filterServices" placeholder="Search by service name" class="form-control"/> 
        </div>

        <!-- services in card format -->
        <div v-if="filteredServices.length > 0" class="row">
          <div class="col-md-4" v-for="service in filteredServices" :key="service.id">
            <div class="card" style="width: 100%; margin-bottom: 20px;">
              <div class="card-body">
                <h5 class="card-title">{{ service.name }}</h5>
                <p class="card-text"><strong>Base Price:</strong> {{ service.base_price }}</p>
                <p class="card-text"><strong>Time Required:</strong> {{ service.time_required }}</p>
                <p class="card-text"><strong>Description:</strong> {{ service.description }}</p>

                <!--request or show "Already Requested" -->
                <button 
                  class="btn" 
                  :class="requestSubmitted[service.id] ? 'btn-warning' : 'btn-primary'" 
                  @click="requestSubmitted[service.id] ? null : toggleForm(service.id)">
                  {{ requestSubmitted[service.id] ? 'Already Requested' : 'Request Service' }}
                </button>

                <!-- Request form (only visible if not requested) -->
                <div v-if="showForm[service.id] && !requestSubmitted[service.id]" style="margin-top: 10px;">
                  <input type="date" v-model="requestDate[service.id]" class="form-control" style="margin-bottom: 10px"/>
                  <textarea v-model="requestRemarks[service.id]" placeholder="Add remarks (optional)" rows="2" class="form-control" style="margin-bottom: 10px;"></textarea>
                  <button class="btn btn-success" @click="submitRequest(service.id)" style="width: 100%; margin-top: 10px;">Submit Request</button>
                </div> 

                <!-- Feedback for form submission -->
                <div v-if="formFeedback[service.id]" style="margin-top: 10px; color: red;">
                  {{ formFeedback[service.id] }}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  `,

  data() {
    return {
      services: [],
      filteredServices: [],
      searchQuery: '',
      requestRemarks: {},
      requestDate: {},
      showForm: {},
      requestSubmitted: {},
      loading: true,
      formFeedback: {},
      auth_token: localStorage.getItem("auth_token"),
      
    };
  },

  methods: {
    
    async fetchServices() {
      
        const response = await fetch('/api/add_service');
        const data = await response.json();

        if (data) {
          this.services = data;
          this.filteredServices = data; // Initially set filtered services to all services
          this.services.forEach(service => {
            this.$set(this.requestRemarks, service.id, '');
            this.$set(this.requestDate, service.id, '');
            this.$set(this.showForm, service.id, false);
            this.$set(this.requestSubmitted, service.id, false);
            this.$set(this.formFeedback, service.id, '');
          });
        } else {
          this.services = [];
          this.filteredServices = [];
        }
      
    },
    toggleForm(serviceId) {
      if (!this.requestSubmitted[serviceId]) {
        this.$set(this.showForm, serviceId, !this.showForm[serviceId]);
      }
    },
    async submitRequest(serviceId) {
      const remarks = this.requestRemarks[serviceId] || '';
      const date = this.requestDate[serviceId];

      if (!date) {
        this.$set(this.formFeedback, serviceId, 'Please select a date for the service.');
        return;
      }

      const service = this.services.find(service => service.id === serviceId);
      if (!service) {
        this.$set(this.formFeedback, serviceId, 'Service not found.');
        return;
      }
        const response = await fetch('/api/create_request', {
          method: 'POST',
          headers: {
            "Authentication-Token": this.auth_token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_name: service.name,
            remarks,
          }),
        });

        const data = await response.json();

        if (data && data.service_request) {
          this.$set(this.requestSubmitted, serviceId, true);
          this.$set(this.formFeedback, serviceId, `Request created successfully: ${data.service_request.id}`);
          this.$set(this.showForm, serviceId, false); // Hide the form after submitting
          
        } else {
          this.$set(this.formFeedback, serviceId, data.message || 'Failed to create service request');
        }
    },
    filterServices() {
      const query = this.searchQuery.toLowerCase();
      this.filteredServices = this.services.filter(service =>
        service.name.toLowerCase().includes(query)
      );
    },
  },

  mounted() {
    this.fetchServices(); 
  },
};
