export default {
    template: `
    <div>
    <div class='d-flex justify-content-center align-items-center' style="min-height: 50vh;">
        <div class="p-4 bg-light" style="width: 90%; max-width: 1200px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">   
            <h3 class="text-center mb-4">Available Services</h3>

            <table class="table table-bordered table-striped">
                <thead class="table-primary">
                    <tr>
                        <th scope="col">Service Name</th>
                        <th scope="col">Base Price</th>
                        <th scope="col">Time Required</th>
                        <th scope="col">Description</th>
                        <th scope="col">Date Created</th>
                        <th scope="col">Date Updated</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(service, index) in all_services" :key="index" style="border-bottom: 1px solid #ddd;">
                        <td>{{ service.name }}</td>
                        <td>{{ service.base_price }}</td>
                        <td>{{ service.time_required }}</td>
                        <td>{{ service.description }}</td>
                        <td>{{ service.date_created }}</td>
                        <td>{{ service.date_updated }}</td>
                        <td>
                            <button @click="delete_service(service.id)" class="btn btn-danger" style="width: 100%;">Delete</button>
                            <button @click="openUpdateForm(service)" class="btn btn-warning mt-2" style="width: 100%;">Update</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Modal for Updating Service -->
            <div v-if="showUpdateModal" class="modal" style="display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5);">
                <div class="modal-content" style="background: white; margin: 10% auto; padding: 20px; border-radius: 8px; width: 50%;">
                    <span class="close" @click="closeUpdateForm" style="cursor: pointer; font-size: 24px;">&times;</span>
                    <h4>Update Service</h4>
                    <form @submit.prevent="update_service">
                        <div>
                            <label for="service_name">Service Name</label>
                            <input type="text" v-model="updateService.name" id="service_name" required>
                        </div>
                        <div>
                            <label for="base_price">Base Price</label>
                            <input type="text" v-model="updateService.base_price" id="base_price" required>
                        </div>
                        <div>
                            <label for="time_required">Time Required</label>
                            <input type="text" v-model="updateService.time_required" id="time_required" required>
                        </div>
                        <div>
                            <label for="description">Description</label>
                            <input type="text" v-model="updateService.description" id="description" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Update Service</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    </div>
    `,

    data() {
        return {
            all_services: [],
            auth_token: localStorage.getItem("auth_token"),
            role: localStorage.getItem("role"),
            delete_resource: { service_id: null },
            showUpdateModal: false,
            updateService: {
                id: null,
                name: '',
                base_price: '',
                time_required: '',
                description: ''
            }
        }
    },

    methods: {
        async available_services() {
            const res = await fetch('/api/add_service', {
                method: 'GET',
                headers: {
                    "Authentication-Token": this.auth_token,
                    'Content-Type': 'application/json',
                },
            })
            const data = await res.json()
            if (res.ok) {
                this.all_services = data
            } else {
                alert(data.message)
            }
        },

        async delete_service(service_id) {
            const requestBody = { service_id };
            const response = await fetch('/api/manage_service', {
                method: 'DELETE',
                headers: {
                    "Authentication-Token": this.auth_token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                await this.available_services();
            } else {
                alert(`Error: ${data.message}`);
            }
        },

        openUpdateForm(service) {
            console.log("Opening update form for:", service); // Debugging statement
            this.updateService.id = service.id;
            this.updateService.name = service.name;
            this.updateService.base_price = service.base_price;
            this.updateService.time_required = service.time_required;
            this.updateService.description = service.description;
            this.showUpdateModal = true;
        },

        closeUpdateForm() {
            this.showUpdateModal = false;
        },

        async update_service() {
            const requestBody = {
                service_id: this.updateService.id,
                service_name: this.updateService.name,
                base_price: this.updateService.base_price,
                time_required: this.updateService.time_required,
                description: this.updateService.description
            };

            const response = await fetch('/api/update_existing_service', {
                method: 'POST',
                headers: {
                    "Authentication-Token": this.auth_token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                this.closeUpdateForm();
                await this.available_services();
            } else {
                alert(`Error: ${data.message}`);
            }
        }
    },

    async mounted() {
        this.available_services();
    }
}
