export default{
    template:`
<div>
    <div class='d-flex justify-content-center align-items-center' style="min-height: 80vh;">
        <div class="mb-3 p-5 bg-light" style="width: 90%; max-width: 600px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <form @submit.prevent="addservice">
            <div class="mb-3">
                <input type='text' placeholder='Service Name' v-model="resource.service_name" class="form-control" required>
            </div>
            <div class="mb-3">
                <input type='text' placeholder='Base Price' v-model="resource.base_price" class="form-control" required>
            </div>
            <div class="mb-3">
                <input type='text' placeholder='Time Required' v-model="resource.time_required" class="form-control" required>
            </div>
            <div class="mb-3">
                <input type='text' placeholder='Description' v-model="resource.description" class="form-control" required>
            </div>
            
            <button type="submit" class="btn btn-primary">Add Service</button>
        </form>
        </div>
    </div>
</div>

    `,

    data(){
        return{
            resource:{
                service_name: null,
                base_price: null,
                time_required: null,
                description: null,
                
            },
            auth_token : localStorage.getItem("auth_token"),
        }
    },
    methods:{
        async addservice(){
            const res = await fetch('/api/add_service',{
                method : 'POST',
                headers : {
                    "Authentication-Token": this.auth_token ,
                    "Content-Type":`application/json`,
                },
                body : JSON.stringify(this.resource),
            })
            const data = await res.json()
            if(res.ok){
                alert(data.message)
                this.$router.push({path : '/admin_dash'})
            }
            else{
                alert(data.message)
            }
        },
    },
}