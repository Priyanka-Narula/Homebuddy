from flask import Blueprint, request, jsonify,current_app as app
from flask_restful import Api, Resource , reqparse , marshal_with , fields  
from flask_security import auth_required , roles_required , current_user 
from sqlalchemy import or_ 
from datetime import datetime , date
from backend.models import *
from sqlalchemy.sql import func

cache = app.cache
api = Api(prefix='/api')

## Create api for new service created by Admin 

#for adding new location and displaying the locations available

class Locations(Resource):
    
    parser = reqparse.RequestParser()
    parser.add_argument('area', type=str, help="Location name (area) is required", required=True)

    def post(self):
        args = self.parser.parse_args()
        area_name = args.get('area').strip()
        
        existing_location = Location.query.filter_by(area=area_name).first()
        if existing_location:
            return {"message": "Location already exists"}, 400
        
        # Add new location
        new_location = Location(area=area_name.capitalize())
        db.session.add(new_location)
        db.session.commit()
        return {"message": "New Location Added Successfully", "location": {"id": new_location.id, "area": new_location.area}}, 201

    def get(self):
        locations = db.session.query(Location).all()
        all_locations = []
        for location in locations:
            all_locations.append({
            'id': location.id,
            'area': location.area
        })
        if len(all_locations) > 0:
            return all_locations
        else:
            return {"message": "No locations found"}, 404

# For adding a new service
class Add_Service(Resource):
    
    parser = reqparse.RequestParser()
    parser.add_argument('service_name', type = str , help = "service name is required" , required = True )
    parser.add_argument('base_price', type = str , help = "base price is required" , required = True )
    parser.add_argument('time_required', type = str , help = "time" , required = True )
    parser.add_argument('description', type = str , help = "description" , required = True)
    
    @auth_required("token")  
    @roles_required("admin")
    def post(self):
        args = self.parser.parse_args()
        service_name = args.get('service_name').strip()  # Remove extra spaces
        base_price = args.get('base_price').strip()
        time_required = args.get('time_required').strip()
        description = args.get('description').strip()

        # Check if service already exists (case insensitive, but database stores capitalized)
        service = Service.query.filter_by(name=service_name.capitalize()).first()  # Capitalize the input for comparison
        
        if service:
            if not service.flag:  # If the service exists but is inactive
                service.flag = True  # Reactivate the service
                service.base_price = base_price  # Update base price
                service.time_required = time_required  # Update time required
                service.description = description  #
                db.session.commit()
                return {"message": "Service reactivated and updated successfully"}, 200
            else:
                return {"message": "Service already exists"}, 200

        # Add a new service
        new_service = Service(
            name=service_name.capitalize(),  # Capitalize the name for consistent formatting
            base_price=base_price.capitalize(),
            time_required=time_required,
            description=description,
            flag=True  # Ensure the new service is active
        )
        db.session.add(new_service)
        db.session.commit()
        return {"message": "New service added successfully"}, 201

    def get(self):
        services = db.session.query(Service).filter_by(flag=True).all()
        all_services = []
        for service in services:
            all_services.append({
                'id':service.id,
                'name': service.name,
                'base_price': service.base_price,
                'time_required': service.time_required,
                'description': service.description,
                'date_created': service.date_created.strftime('%Y-%m-%d'),
                'date_updated': service.date_updated.strftime('%Y-%m-%d')
            })
        if len(all_services) > 0:
            return all_services
        else :
            return ({"message":"No service found"}) , 404
        
#new deleterequest try

# API for managing services (Delete and Update)
class Manage_Service(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('service_id', type=int, help="Service name is required", required=True)
    parser.add_argument('service_name', type=str, help="Service name is required", required=False)
    parser.add_argument('base_price', type=str, help="Base price is required", required=False)
    parser.add_argument('time_required', type=str, help="Time is required", required=False)
    parser.add_argument('description', type=str, help="Description is required", required=False)

    # DELETE Service (Admin Only) 
    ## Delete all the service id from every table then delete the service 
    @auth_required("token")
    @roles_required("admin")
    def delete(self):
        args = self.parser.parse_args()
        service = args.get('service_id')
        service_delete = Service.query.filter_by(id = service).first()
        if not service:
            return {"message": "Service not found"}, 404
        
        
        service_delete.flag = False
        #db.session.delete(service_delete)
        db.session.commit()
        return {"message": f"Service with id {service} has been deleted successfully"}, 200

    
        
#customer creating a servicerequest api
class CreateServiceRequest(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('service_name', type=str, required=True, help="Service name is required")
    parser.add_argument('remarks', type=str, required=False, help="Remarks are optional")

    @auth_required("token")  
    @roles_required("customer")  
    def post(self):
        # Parse the arguments
        args = self.parser.parse_args()
        service_name = args['service_name']
        remarks = args.get('remarks', None)
        customer = current_user  # Flask-Security provides `current_user`

        if not customer:
            return {"message": "Customer not found"}, 404

        # Check if the service exists
        service = Service.query.filter_by(name=service_name).first()
        if not service:
            return {"message": f"Service '{service_name}' not found"}, 404

        # Check if the customer has any incomplete requests for the same service
        incomplete_request = ServiceRequest.query.filter(
            ServiceRequest.customer_id == customer.id,
            ServiceRequest.service_id == service.id,
            ServiceRequest.service_status.notin_(['completed', 'Customer Canceled ' ,'Rejected'])  # Status not completed or canceled
        ).first()

        if incomplete_request:
            return {
                "message": f"You already have an active request for the service '{service_name}'."
            }, 400

        # Create a new service request
        new_service_request = ServiceRequest(
            service_id=service.id,
            customer_id=customer.id,
            date_of_request=db.func.current_date(),
            remarks=remarks,
            service_status='requested'
        )

        db.session.add(new_service_request)
        db.session.commit()

        return {
            "message": "Service request created successfully",
            "service_request": {
                "id": new_service_request.id,
                "service_name": service.name,
                "customer_id": customer.id,
                "customer_email": customer.email,
                "remarks": remarks,
                "status": new_service_request.service_status,
                "date_of_request": new_service_request.date_of_request.isoformat()
            }
        }, 201

#api for request canceled by customer

# Define the endpoint to get available requests for professionals
from sqlalchemy.orm import aliased
RoleAlias = aliased(Role)

class Show_Available_Request_Prof(Resource):
    @auth_required('token')
    @roles_required('professional')
    def get(self):
        # Get the professional's location and service ID from the logged-in user
        prof_location_id = current_user.location_id  
        prof_service_id = current_user.service_id 

        # Build the query with additional filters for location, service, and service status
        query = (
            db.session.query(
                ServiceRequest.id.label('service_request_id'),
                ServiceRequest.date_of_request,
                ServiceRequest.service_status,
                ServiceRequest.remarks,
                User.username,
                User.email,
                User.location_id,
                User.address,
                User.preferred_contact,
                Service.name.label('service_name'),
                Service.base_price,
                ServiceRequest.date_of_completion,
            )
            .join(User, ServiceRequest.customer_id == User.id)
            .join(UserRoles, User.id == UserRoles.user_id)
            .join(RoleAlias, UserRoles.role_id == RoleAlias.id)
            .join(Service, ServiceRequest.service_id == Service.id)  # Join Service
            .filter(User.location_id == prof_location_id)  # Filter by professional's location
            .filter(ServiceRequest.service_id == prof_service_id)  # Filter by professional's service
            #.filter(ServiceRequest.service_status == 'requested')
        )
        
        # Execute the query and fetch all results
        results = query.all()
        print(results)

        # Serialize the results
        data = []
        for row in results:
            data.append({
                "service_request_id": row.service_request_id,
                "date_of_request": row.date_of_request.strftime('%Y-%m-%d') if row.date_of_request else None,
                "service_status": row.service_status,
                "remarks": row.remarks,
                "username": row.username,
                "email": row.email,
                "location_id": row.location_id,
                "address": row.address,
                "preferred_contact":row.preferred_contact,
                "service_name": row.service_name,
                "base_price": row.base_price,
                "date_of_completion": row.date_of_completion.strftime('%Y-%m-%d') if row.date_of_completion else None
            })

        # Return JSON response
        if data:
            return data, 200
        else:
            return {"message": "No pending requests"}, 200



class Service_Record(Resource):

    @auth_required("token")
    #@cache.memoize(timeout=5)

    def get(self):     
        
        record_list = []
        
        if "admin" in current_user.roles :
            # Query for service requests where the current user is the customer
            service_requests = db.session.query(ServiceRequest, Service.name).join(
                Service, Service.id == ServiceRequest.service_id
            ).all()

            for request, service_name in service_requests:
                record_list.append({
                    'request_id': request.id,
                    'service_name': service_name,
                    'date_of_request': request.date_of_request.strftime("%Y-%m-%d") if request.date_of_request else None,
                    'date_of_completion': request.date_of_completion.strftime("%Y-%m-%d") if request.date_of_completion else None,
                    'service_status': request.service_status,
                    'remarks': request.remarks,
                    'customer_id':request.customer_id,
                    'professional_id':request.professional_id
                    
                })

            if len(record_list) >0:
                return record_list , 200
            else:
                return{"message":"No record found for admin"} , 404


        if "customer" in current_user.roles :
            
            service_requests = db.session.query(
                ServiceRequest, 
                Service.name, 
                User.username, 
                User.email
            ).join(
                Service, Service.id == ServiceRequest.service_id
            ).join(
                User, User.id == ServiceRequest.customer_id  # Join with User to get customer details
            ).filter(
                ServiceRequest.customer_id == current_user.id
            ).all()

            # Prepare the response data for the 'user' role
            for request, service_name, username, email in service_requests:
                record_list.append({
                    'request_id': request.id,
                    'service_name': service_name,
                    'professional_id': request.professional_id ,
                    'date_of_request': request.date_of_request.strftime("%Y-%m-%d") if request.date_of_request else None,
                    'date_of_completion': request.date_of_completion.strftime("%Y-%m-%d") if request.date_of_completion else None,
                    'service_status': request.service_status,
                    'remarks': request.remarks,
                    'customer_username': username,
                    'customer_email': email
                })
            if len(record_list) >0:
                return record_list , 200
            else:
                return{"message":"No record found for customer"} , 404

        # If the user has the 'professional' role
        if 'professional' in current_user.roles:
            # Query for service requests where the current user is the professional
            service_requests = db.session.query(ServiceRequest, Service.name).join(
                Service, Service.id == ServiceRequest.service_id
            ).filter(ServiceRequest.professional_id == current_user.id).all()

            # Prepare the response data for the 'professional' role
            for request, service_name in service_requests:
                record_list.append({
                    'request_id': request.id,
                    'service_name': service_name,
                    'professional_id': request.professional_id ,
                    'date_of_request': request.date_of_request.strftime("%Y-%m-%d") if request.date_of_request else None,
                    'date_of_completion': request.date_of_completion.strftime("%Y-%m-%d") if request.date_of_completion else None,
                    'service_status': request.service_status,
                    'remarks': request.remarks
                })
            if len(record_list) >0:
                return record_list , 200
            else:
                return{"message":"No record found for prof"} , 404
       

#api to approve request professional or admin
class Approve_Request(Resource):
    
    # Parse the request ID from the request body
    request = reqparse.RequestParser()
    request.add_argument('req_id', type=int, help="Invalid Request ID", required=True)
    
    @auth_required("token")
    @roles_required('professional')
    def post(self):
        args = self.request.parse_args()
        req_idd = args.get('req_id')
        
        # Fetch the request record by ID
        req = ServiceRequest.query.filter_by(id=req_idd).first()
        prof_id=current_user.id
        
        if not req:
            return {"message": "Request doesn't exist"}, 404

        if "professional" in current_user.roles:
            req.service_status = "Professional Assigned"
            req.professional_id=prof_id
            db.session.commit()
            
        return {"message": "Request Accepted"}, 200
    

class Reject_Request(Resource):
        
        request = reqparse.RequestParser()
        request.add_argument('req_id', type=int, required=True, help="Invalid Request ID")

        @auth_required("token")
        def post(self):
            args = self.request.parse_args()
            req_id = args.get('req_id')
            req = ServiceRequest.query.filter_by(id=req_id).first()

            if not req:
                return {"message": "Request doesn't exist"}, 404

            if "professional" in current_user.roles:
                req.service_status = "Rejected "
            elif "admin" in current_user.roles:
                req.service_status = "Rejected "
            elif "customer" in current_user.roles:
                req.service_status = "Customer Canceled "    

            db.session.commit()
            return {"message": "Request Rejected"}, 200
        
#api for customer to update an existing request
class Update_Request(Resource):
    @auth_required("token")
    def post(self):
        data = request.get_json()
        request_id = data.get("request_id")
        preferred_date = data.get("preferred_date")
        remarks = data.get("remarks")

        # Find the service request for the current user
        service_request = ServiceRequest.query.filter_by(
            id=request_id).first()

        if not service_request:
            return {"message": "Service request not found"}, 404

        # Update fields
        if preferred_date:
            service_request.date_of_request = datetime.strptime(preferred_date, "%Y-%m-%d").date()
        if remarks:
            service_request.remarks = remarks

        db.session.commit()
        return {"message": "Service request updated successfully"}, 200        



class Submit_Rating(Resource):
    @auth_required('token')
    def post(self):
        data = request.get_json()
        request_id = data.get('request_id')
        rating = data.get('rating')
        comments = data.get('review', "")  

        if not rating :
            return ({"message": "Rating must be provided"}), 400
        if not request_id:
            return ({"message": "Request ID is required"}), 400
        
        service_request = ServiceRequest.query.filter_by(
            id=request_id).first()

        review = Review(
            service_request_id=request_id,
            rating=rating,
            customer_id=service_request.customer_id,
            professional_id=service_request.professional_id,
            created_at=db.func.current_date(),
            comments=comments
        )
        
        db.session.add(review)
        
        service_request.service_status = 'completed'
        service_request.date_of_completion=db.func.current_date()
        db.session.commit()

        return ({"message": "Rating and review submitted successfully, service request marked as completed!"}), 200

# Flask API to fetch statistics
class Statistics(Resource):
    @auth_required('token')
    def get(self):
        
        total_users = User.query.count()
        total_services = Service.query.count()
        total_service_requests = ServiceRequest.query.count()

        pending_requests = ServiceRequest.query.filter(
            ServiceRequest.service_status.in_(['requested', 'Professional Assigned'])
        ).count()

        canceled_requests = ServiceRequest.query.filter(
            ServiceRequest.service_status.in_(['customer canceled', 'rejected'])
        ).count()

        completed_requests = ServiceRequest.query.filter(
            ServiceRequest.service_status == 'completed'
        ).count()

        return ({
            'total_users': total_users,
            'total_services': total_services,
            'total_service_requests': total_service_requests,
            'pending_requests': pending_requests,
            'canceled_requests': canceled_requests,
            'completed_requests': completed_requests
        }) , 200

#api to display all users to admin

class Display_Users(Resource):
    @auth_required("token")   
    @roles_required("admin")  
    def get(self):
        users = User.query.all()
        result = []
        
        for user in users:
            # Fetch roles
            temp_role = [role.name for role in user.roles]

            if "admin" in temp_role:
                continue

            # fields for professionals
            avg_rating = None
            location_name = None
            service_name = None
            
            if "professional" in temp_role:  
                avg_rating = db.session.query(func.avg(Review.rating)) \
                    .filter(Review.professional_id == user.id) \
                    .scalar()
                location = Location.query.get(user.location_id)
                if location:
                    location_name = location.area
                else:
                    location_name = "unknown " 
                service = Service.query.get(user.service_id)
                service_name = service.name if service else "Not assigned"

            result.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "active": user.active,
                "roles": temp_role[0] if temp_role else "No role assigned",  
                "location_id": user.location_id,
                "location_name": location_name,  
                "service_name": service_name,  
                "average_rating": round(avg_rating, 2) if avg_rating else None, 
                "is_professional": "professional" in temp_role,  
                "address": user.address if "customer" in temp_role else None 
            })

        return result, 200
    

class Update_Existing_Service(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('service_id', type=int, help="Service ID is required", required=True)
    parser.add_argument('service_name', type=str, help="Service name is required", required=False)
    parser.add_argument('base_price', type=str, help="Base price is required", required=False)
    parser.add_argument('time_required', type=str, help="Time required is required", required=False)
    parser.add_argument('description', type=str, help="Description is required", required=False)

    #  Update service details (Admin only)
    @auth_required("token")
    @roles_required("admin")
    def post(self):
        args = self.parser.parse_args()
        service_id = args.get('service_id')
        service_name = args.get('service_name').strip()

        # Check if the service exists
        service = Service.query.filter_by(id=service_id).first()
        if not service:
            return {"message": "Service not found"}, 404

        # Check if another service with the same name exists (excluding the current service)
        existing_service = Service.query.filter(Service.name == service_name.capitalize(), Service.id != service_id).first()
        if existing_service:
            return {"message": f"A service with the name '{service_name}' already exists."}, 400

        # Update the service details
        if service_name:
            service.name = service_name.capitalize()
        if args.get('base_price'):
            service.base_price = args.get('base_price')
        if args.get('time_required'):
            service.time_required = args.get('time_required')
        if args.get('description'):
            service.description = args.get('description')

        # Commit changes
        db.session.commit()
        return {"message": "Service updated successfully"}, 200

# Add the resource to the API
api.add_resource(Locations,'/locations') #/api/locations with post to add and get to display locations
api.add_resource(Manage_Service,'/manage_service') # /api/manage_service ,delete request to delete,put request to update
api.add_resource(Add_Service ,'/add_service') # /api/add_service post request to add new and get request to display all available services
api.add_resource(Display_Users ,'/display_users') #/api/display_cust get request to display on admin page
api.add_resource(CreateServiceRequest ,'/create_request') #/api/create_request post sent by customer request status "requested"
api.add_resource(Approve_Request ,'/approve_request') #/api/approve_request for accept request for prof and admin
api.add_resource(Reject_Request,'/reject_request') #/api/reject_request for cancel/ reject request for all roles
api.add_resource(Update_Request,'/update_request')
api.add_resource(Submit_Rating,'/submit_rating')
api.add_resource(Statistics,'/statistics')
api.add_resource(Show_Available_Request_Prof ,'/show_available_request_prof')#/api/servicerequestsforprofessional
api.add_resource(Service_Record ,'/service_record')#/api/servicerequestsforprofessional
api.add_resource(Update_Existing_Service ,'/update_existing_service')#/api/servicerequestsforprofessional
