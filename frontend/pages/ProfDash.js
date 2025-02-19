export default {
  template: `
    <div>
      <div style="padding: 15px;">
        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); padding: 20px;">
          <h3 style="text-align: center; margin-bottom: 20px; color: #333;">Pending Requests</h3>
          <div v-if="all_requests.length === 0">
            <p>No pending requests available</p>
          </div>
        
                 
          <table v-else class="table table-striped" style="border-collapse: collapse; width: 95%; text-align: left; margin: 0 auto;">
            <thead style="background-color: #007bff; color: white;">
              <tr>
                <th scope="col">R.ID</th>
                <th scope="col">Service Name</th>
                <th scope="col">Requested Date</th>
                <th scope="col">Customer Name</th>
                <th scope="col">Email</th>
                <th scope="col">Remarks</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loop through pending_requests -->
              <tr v-for="(request, index) in all_requests" :key="index" v-if="request.service_status === 'requested'" style="border-bottom: 1px solid #ddd;">
               
                <td>{{ request.service_request_id }}</td>
                <td>{{ request.service_name }}</td>
                <td>{{ request.date_of_request }}</td>
                <td>{{ request.username }}</td>
                <td>{{ request.email }}</td>
                <td>{{ request.remarks }}</td>
                <td>
                  <button @click="accept_request(request.service_request_id)" class="btn btn-success" style="margin-right: 5px;">Accept</button>
                  <button @click="cancel_request(request.service_request_id)" class="btn btn-danger">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style="padding: 15px;">
        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); padding: 20px;">
          <h3 style="text-align: center; margin-bottom: 20px; color: #333;">All Requests</h3>

          <table class="table table-striped" style="border-collapse: collapse; width: 95%; text-align: left; margin: 0 auto;">
            <thead style="background-color: #007bff; color: white;">
              <tr>
                <th scope="col">R.ID</th>
                <th scope="col">Service Name</th>
                <th scope="col">Requested Date</th>
                <th scope="col">Customer Name</th>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
                
              </tr>
            </thead>
            <tbody>
              <!-- Loop through requests -->
              <tr v-for="(request, r_index) in all_requests" :key="r_index" v-if="request.service_status !== 'requested'" style="border-bottom: 1px solid #ddd;">
                <td>{{ request.service_request_id }}</td>
                <td>{{ request.service_name }}</td>
                <td>{{ request.date_of_request }}</td>
                <td>{{ request.username }}</td>
                <td>{{ request.email }}</td>
                <td>{{ request.service_status }}</td>
                
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,

  data(){
    return {
      all_requests: [],
      auth_token: localStorage.getItem("auth_token"),
      role: localStorage.getItem("role"),
      resource_action: {
        req_id: null,
      },
    };
},

methods:{
    async pending_requests(){
        const res =  await fetch('/api/show_available_request_prof' , {
            method: 'GET',
            headers: {
                "Authentication-Token":this.auth_token,
            },
        })
        const data = await res.json()
        if(res.ok){
            this.all_requests = data
            
        }
        else{
            alert(data.message)
        }
    },

    async accept_request(req_id) {
      this.resource_action.req_id = req_id;
      const res = await fetch("/api/approve_request", {
        method: "POST",
        headers: {
          "Authentication-Token": this.auth_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.resource_action),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        await this.pending_requests();
      } else {
        alert(data.message);
      }
    },

    async cancel_request(req_id) {
      this.resource_action.req_id = req_id;
      const res = await fetch("/api/reject_request", {
        method: "POST",
        headers: {
          "Authentication-Token": this.auth_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.resource_action),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        await this.pending_requests();
      } else {
        alert(data.message);
      }
    },
  },

async mounted() {
    this.pending_requests();
}
};
