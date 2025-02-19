export default {
    template: `
<div>
    <div class='d-flex justify-content-center align-items-center' style="min-height: 50vh;">
        <div class="p-4 bg-light" style="width: 90%; max-width: 1200px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h3 class="text-center mb-4">Professional's List</h3>
            
            <!-- Search Section -->
            <div class="mb-4">
                <div class="row g-2">
                    <div class="col-md-4">
                        <input 
                            v-model="filters.name" 
                            class="form-control" 
                            placeholder="Search by Name">
                    </div>
                    <div class="col-md-4">
                        <input 
                            v-model="filters.location" 
                            class="form-control" 
                            placeholder="Search by Location">
                    </div>
                    <div class="col-md-4">
                        <input 
                            v-model="filters.service" 
                            class="form-control" 
                            placeholder="Search by Service Name">
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <table class="table table-bordered table-striped">
                <thead class="table-primary">
                    <tr>
                        <th scope="col">User ID</th>
                        <th scope="col">Username</th>
                        <th scope="col">Email</th>
                        <th scope="col">Location</th>
                        <th scope="col">Role</th>
                        <th scope="col">Rating</th>
                        <th scope="col">Service Name</th>
                        <th scope="col">Status</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user, index) in filteredUsers" :key="index">
                        <td>{{ user.id }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.location_name || 'Unknown' }}</td>
                        <td>{{ user.roles }}</td>
                        <td>{{ user.average_rating || 'Unknown' }}</td>
                        <td>{{ user.service_name || 'Unknown' }}</td>
                        <td>
                            <span v-if="user.active" class="text-success">Active</span>
                            <span v-else class="text-danger">Inactive</span>
                        </td>
                        <td>
                            <button 
                                :class="user.active ? 'btn btn-danger' : 'btn btn-primary'" 
                                @click="toggle_user_status(user.id)">
                                {{ user.active ? 'Deactivate' : 'Activate' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <br>
    <div class='d-flex justify-content-center align-items-center' style="min-height: 50vh;">
        <div class="p-4 bg-light" style="width: 90%; max-width: 1200px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h3 class="text-center mb-4">User's Table</h3>
            
            <!-- Users Table -->
            <table class="table table-bordered table-striped">
                <thead class="table-primary">
                    <tr>
                        <th scope="col">User ID</th>
                        <th scope="col">Username</th>
                        <th scope="col">Email</th>
                        <th scope="col">Location</th>
                        <th scope="col">Role</th>
                        <th scope="col">Status</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user, index) in users" :key="r_index" v-if="user.roles === 'customer'">
                        <td>{{ user.id }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.location_name || 'Unknown' }}</td>
                        <td>{{ user.roles }}</td>
                        <td>
                            <span v-if="user.active" class="text-success">Active</span>
                            <span v-else class="text-danger">Inactive</span>
                        </td>
                        <td>
                            <button 
                                :class="user.active ? 'btn btn-danger' : 'btn btn-primary'" 
                                @click="toggle_user_status(user.id)">
                                {{ user.active ? 'Block' : 'Un-Block' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
</div>
    `,
    data() {
        return {
            users: [], // Full list of users fetched from the backend
            auth_token: localStorage.getItem("auth_token"),
            filters: {
                name: "",
                location: "",
                service: "",
            },
        };
    },
    computed: {
        filteredUsers() {
            // Apply filters to users list
            return this.users.filter(user => {
                const matchesName = user.username
                    .toLowerCase()
                    .includes(this.filters.name.toLowerCase());
                const matchesLocation = user.location_name
                    ?.toLowerCase()
                    .includes(this.filters.location.toLowerCase());
                const matchesService = user.service_name
                    ?.toLowerCase()
                    .includes(this.filters.service.toLowerCase());

                return matchesName && matchesLocation && matchesService;
            });
        },
    },
    methods: {
        async toggle_user_status(user_id) {
            try {
                const res = await fetch(`/toggle/user/${user_id}`, {
                    method: "GET",
                    headers: {
                        "Authentication-Token": this.auth_token,
                    },
                });
                const data = await res.json();
                if (res.ok) {
                    await this.fetch_users();
                    alert(data.message);
                } else {
                    alert(`Error: ${data.message || 'Failed to toggle user status'}`);
                }
            } catch (error) {
                console.error("Error toggling user status:", error);
                alert("An error occurred while toggling user status.");
            }
        },

        async fetch_users() {
            try {
                const res = await fetch('/api/display_users', {
                    headers: {
                        "Authentication-Token": this.auth_token,
                    },
                });
                const data = await res.json();
                if (res.ok) {
                    this.users = data;
                } else {
                    alert(`Error: ${data.message || 'Failed to fetch users'}`);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                alert("An error occurred while fetching users.");
            }
        },
    },
    async mounted() {
        await this.fetch_users();
    },
};
