export default {
  template: `
    <div>
      <div style="padding: 15px;">
             <!-- Actions Table -->
        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); padding: 20px;">
          <h3 style="text-align: center; margin-bottom: 20px; color: #333;">My Current Requests</h3>
          <table class="table table-striped" style="border-collapse: collapse; width: 95%; text-align: left; margin: 0 auto;">
            <thead style="background-color: #6c757d; color: white;">
              <tr>
                <th scope="col">RequestID</th>
                <th scope="col">Service Name</th>
                <th scope="col">Preferred Date</th>
                <th scope="col">Remarks</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in all_records" :key="index" v-if ="record.service_status === 'requested' || record.service_status === 'Professional Assigned'"  style="border-bottom: 1px solid #ddd;">
                <td>{{ record.request_id }}</td>
                <td>{{ record.service_name }}</td>
                <td>{{ record.date_of_request }}</td>
                <td>{{ record.remarks }}</td>
                <td>{{ record.service_status }}</td>
                <td>
                  <!-- Cancel Button -->
                  <button @click="cancel_request(record.request_id )" class="btn btn-danger" style="margin-right: 5px;">Cancel</button>
                  <button class="btn btn-warning" @click="openUpdateForm(record)">Update</button>
                  <button v-if="record.service_status === 'Professional Assigned'" class="btn btn-success" @click="openRatingForm(record)">Mark Completed</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

        <!-- Previous Requests Table -->
        <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); padding: 20px; margin-bottom: 20px;">
          <h3 style="text-align: center; margin-bottom: 20px; color: #333;">Previous Requests</h3>
          
          <table class="table table-striped" style="border-collapse: collapse; width: 95%; text-align: left; margin: 0 auto;">
            <thead style="background-color: #007bff; color: white;">
              <tr>
                <th scope="col">RequestID</th>
                <th scope="col">Service Name</th>
                <th scope="col">Date Requested</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in all_records" :key="index" v-if="record.service_status !== 'requested'" style="border-bottom: 1px solid #ddd;">
                <td>{{ record.request_id }}</td>
                <td>{{ record.service_name }}</td>
                <td>{{ record.date_of_request }}</td>
                <td>{{ record.service_status }}</td>
              </tr>
            </tbody>
          </table>
          
        </div>

   
<!-- Update Form Modal -->
      <div v-if="showUpdateForm" class="modal" style="display: block;">
        <div class="modal-content" style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          <h3>Update Request</h3>
          <form @submit.prevent="submitUpdate">
            <div>
              <label for="preferred_date">Preferred Date (Required)</label>
              <input type="date" v-model="updateForm.preferred_date" required />
            </div>
            <div>
              <label for="remarks">Remarks (Optional)</label>
              <textarea v-model="updateForm.remarks" placeholder="Optional remarks"></textarea>
            </div>
            <div>
              <button type="submit" class="btn btn-primary">Save Changes</button>
              <button type="button" class="btn btn-secondary" @click="closeUpdateForm">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Rating Form Modal -->
      <div v-if="showRatingForm" class="modal" style="display: block;">
        <div class="modal-content" style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          <h3>Rate Your Experience!</h3>
          <form @submit.prevent="submitRating">
            <div>
              <label for="rating">Rating (1-5):</label>
              <input type="number" v-model="ratingForm.rating" min="1" max="5" required />
            </div>
            <div>
              <label for="review">Review (Optional):</label>
              <textarea v-model="ratingForm.review" placeholder="Write a review (optional)"></textarea>
            </div>
            <div>
              <button type="submit" class="btn btn-primary">Submit Rating</button>
              <button type="button" class="btn btn-secondary" @click="closeRatingForm">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      all_records: [],
      auth_token: localStorage.getItem("auth_token"),
      role: localStorage.getItem("role"),
      showUpdateForm: false,
      showRatingForm: false,
      ratingForm: {
        request_id: null,
        rating: 1,
        review: "",
      },
      updateForm: {
        request_id: null,
        preferred_date: "",
        remarks: "",
      },
      resource_action: {
        req_id: null, 
      },
    };
  },

  methods: {
    async service_record() {
      const res = await fetch('/api/service_record', {
        method: 'GET',
        headers: {
          "Authentication-Token": this.auth_token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        this.all_records = data;
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
        await this.service_record();
      } else {
        alert(data.message);
      }
    },


    openUpdateForm(record) {
      this.updateForm.request_id = record.request_id;
      this.updateForm.preferred_date = record.preferred_date;
      this.updateForm.remarks = record.remarks;
      this.showUpdateForm = true;
    },
    closeUpdateForm() {
      this.showUpdateForm = false;
    },

    
    async submitUpdate() {
      const { request_id, preferred_date, remarks } = this.updateForm;

      if (!preferred_date) {
        alert("Preferred date is required!");
        return;
      }

      const fields = { request_id, preferred_date, remarks };

      const res = await fetch("/api/update_request", {
        method: "POST",
        headers: {
          "Authentication-Token": this.auth_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        this.showUpdateForm = false; 
        await this.service_record(); 
      } else {
        alert(data.message);
      }
    },

    openRatingForm(record) {
      this.ratingForm.request_id = record.request_id;
      this.showRatingForm = true;
    },

    
    closeRatingForm() {
      this.showRatingForm = false;
    },


    async submitRating() {
      const { request_id, rating, review } = this.ratingForm;

      const fields = { request_id, rating, review };

      const res = await fetch("/api/submit_rating", {
        method: "POST",
        headers: {
          "Authentication-Token": this.auth_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        this.showRatingForm = false;
        await this.service_record();
      } else {
        alert(data.message);
      }
    },
  },

  async mounted() {

  },

  async mounted() {
    this.service_record();
  },
};
