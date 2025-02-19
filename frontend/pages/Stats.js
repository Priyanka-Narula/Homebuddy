export default {
    template: `
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-4">
                <div class="card shadow-lg">
                    <div class="card-body">
                        <h5 class="card-title text-center">Total Users</h5>
                        <p class="card-text text-center display-4">{{ total_users }}</p>
                    </div>
                </div>
            </div>

            
            <div class="col-md-4">
                <div class="card shadow-lg">
                    <div class="card-body">
                        <h5 class="card-title text-center">Total Services</h5>
                        <p class="card-text text-center display-4">{{ total_services }}</p>
                    </div>
                </div>
            </div>

            
            <div class="col-md-4">
                <div class="card shadow-lg">
                    <div class="card-body">
                        <h5 class="card-title text-center">Total Service Requests</h5>
                        <p class="card-text text-center display-4">{{ total_service_requests }}</p>
                    </div>
                </div>
            </div>

            
            <div class="col-md-4 mt-3">
                <div class="card shadow-lg">
                    <div class="card-body">
                        <h5 class="card-title text-center">Pending Requests</h5>
                        <p class="card-text text-center display-4">{{ pending_requests }}</p>
                    </div>
                </div>
            </div>

            
            <div class="col-md-4 mt-3">
                <div class="card shadow-lg">
                    <div class="card-body">
                        <h5 class="card-title text-center">Canceled Requests</h5>
                        <p class="card-text text-center display-4">{{ canceled_requests }}</p>
                    </div>
                </div>
            </div>

            
            <div class="col-md-4 mt-3">
                <div class="card shadow-lg">
                    <div class="card-body">
                        <h5 class="card-title text-center">Completed Requests</h5>
                        <p class="card-text text-center display-4">{{ completed_requests }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            total_users: 0,
            total_services: 0,
            total_service_requests: 0,
            pending_requests: 0,
            canceled_requests: 0,
            completed_requests: 0,
            auth_token: localStorage.getItem("auth_token"),
        };
    },

    methods: {
        
        async fetchStatistics() {
            const res = await fetch('/api/statistics', {
                method: 'GET',
                headers: {
                    "Authentication-Token": this.auth_token,
                },
            });

            const data = await res.json();
            if (res.ok) {
                
                this.total_users = data.total_users;
                this.total_services = data.total_services;
                this.total_service_requests = data.total_service_requests;
                this.pending_requests = data.pending_requests;
                this.canceled_requests = data.canceled_requests;
                this.completed_requests = data.completed_requests;
            } else {
                alert('Failed to load statistics');
            }
        },
    },

    mounted() {
        this.fetchStatistics(); 
}
}
