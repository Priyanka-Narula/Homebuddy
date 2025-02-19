export default {
    template: `
<div>
    <div class='d-flex justify-content-center align-items-center' style="min-height: 50vh;">
        <div class="p-4 bg-light" style="width: 90%; max-width: 1200px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">   

            <h3 class="text-center mb-4">Ongoing Requests</h3>

            <!-- Service Requests Table -->
            <table class="table table-bordered table-striped">
                <thead class="table-primary">
                    <tr>
                        <th scope="col">Request ID</th>
                        <th scope="col">Service Name</th>
                        <th scope="col">Customer</th>
                        <th scope="col">Professional</th>
                        <th scope="col">Date of Request</th>
                        <th scope="col">Date of Completion</th>
                        <th scope="col">Status</th>
                        
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(request, index) in serviceRequests" :key="index">
                        <td>{{ request.request_id }}</td>
                        <td>{{ request.service_name }}</td>
                        <td>{{ request.customer_id }}</td>
                        <td>{{ request.professional_id || 'Not Assigned' }}</td>
                        <td>{{ request.date_of_request }}</td>
                        <td>{{ request.date_of_completion }}</td>
                        <td>{{ request.service_status }}</td>
                        
                    </tr>
                </tbody>
            </table>
            <div class="text-center mt-4">
                <button class="btn btn-success" @click="download_csv">Download as CSV</button>
            </div>
            </div>
            
    </div>
</div>
    `,
    data() {
        return {
            serviceRequests: [], 
            auth_token: localStorage.getItem("auth_token"),
            role: localStorage.getItem("role"),
            download_csv_data:null
        };
    },
    methods: {
        async download_csv(){
            const res = await fetch(`${location.origin}/create-csv`,{
                method:'GET',
                headers:{
                    "Authentication-Token": this.auth_token,
                    
                }
            })
            const task_id= (await res.json()).task_id
            const interval = setInterval(async() => {
                const res = await fetch(`${location.origin}/get-csv/${task_id}` )
                if (res.ok){
                    window.open(`${location.origin}/get-csv/${task_id}`)
                    clearInterval(interval)
                }

            }, 100)
          },
        
        
        
        async fetch_service_requests() {
                const res = await fetch('/api/service_record', {
                    headers: {
                        "Authentication-Token": this.auth_token,
                    },
                });
                const data = await res.json();
                if (res.ok) {
                    this.serviceRequests = data ;
                } 
            },
        },
        
        async mounted() {
            await this.fetch_service_requests();
        },
    };
