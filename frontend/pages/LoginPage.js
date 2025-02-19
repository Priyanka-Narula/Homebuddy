export default {
  template: `
    <div class="d-flex justify-content-center align-items-center" :style="containerStyle"  >
      <form @submit.prevent="submitLogin" class="w-25">
        <div :style="formStyle" class="bg-light border rounded shadow-sm">
          <h3 class="text-center mb-3">Login</h3>

          <div class="mb-2">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              v-model="email"
              class="form-control"
            />
          </div>

          <div class="mb-2">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              v-model="password"
              class="form-control"
            />
          </div>

          <button type="submit" class="btn btn-primary mt-3">Login</button>
          <div class="text-danger mt-2">{{ error }}</div>
        </div>
      </form>
    </div>
  `,
  data() {
    return {
      email: null,
      password: null,
      error: null,
      // Style Objects
      containerStyle: {
        height: '100vh', 
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',
        margin: '0',
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
    async submitLogin() {
      try {
        const res = await fetch(`${location.origin}/u_login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem('auth_token', data.token); // all this data.token coming from routes.py at /u_login route as keys
          localStorage.setItem('role', data.role);
          localStorage.setItem('email', data.email);

          // Redirect user to dashboard based on role
          if (data.role === 'customer') {
            this.$router.push({ path: '/user_dash' });
          } else if (data.role === 'professional') {
            this.$router.push({ path: '/prof_dash' });
          } else if (data.role === 'admin') {
            this.$router.push({ path: '/admin_dash' });
          }
        } else {
          // Display error message
          this.error = data.message || 'Login failed';
        }
      } catch (err) {
        this.error = 'An error occurred. Please try again.';
        console.error(err);
      }
    },
  },
};
