export default{
    template:`
    <div class="d-flex justify-content-center align-items-center" :style="containerStyle">
  <div class="profile-container">
    <div :style="formStyle" class="bg-light border rounded shadow-sm p-4">
      <h3 class="text-center mb-3">Profile</h3>
  
      <div class="mb-2">
        <strong>Email:</strong> <span>{{ email }}</span>
      </div>
      <div class="mb-2">
        <strong>Role:</strong> <span>{{ role }}</span>
      </div>
    </div>
  </div>
</div>


  </template>
  `,
  
   data() {
      return {
        email: null,
        role: null,
      };
    },
    mounted() {
     
      this.getUserInfo();
    },
    methods: {
      
      getUserInfo() {
        this.email = localStorage.getItem('email');
        this.role = localStorage.getItem('role');
      }
    }
  };
  
  
  
  