from flask import current_app as app, jsonify, render_template , request, send_file 
from flask_security import auth_required, verify_password , hash_password ,roles_required
from backend.models import db
from backend.models import *
from datetime import datetime
from backend.celery.tasks import generate_csv
from celery.result import AsyncResult


datastore = app.security.datastore
cache = app.cache


#celery task to download the Service Requests in .csv file
@auth_required('token')
@app.get('/create-csv')
def create_csv_route():
    task = generate_csv.delay()   #.delay() is a celery specific func that runs func in celery worker
    return {'task_id' : task.id},200

@auth_required('token') 
@app.get('/get-csv/<id>')
def getCSV(id):
    result = AsyncResult(id)

    if result.ready():
        return send_file(f'./backend/celery/user-downloads/{result.result}'), 200
    else:
        return {'message' : 'task not ready'}, 405


@app.get('/')
def home():
    return render_template('index.html')

@app.route('/u_login' ,methods=['POST'])
def u_login():
    data = request.get_json()  #this converts data from the login form in key value pair

    email = data.get('email')
    password = data.get('password')

    if not email or not password:  #ctrl+. for import shortcut
        return jsonify({"message" : "*Please provide valid credentials"}) ,404
    user  = datastore.find_user(email = email)

    if not user:
        return jsonify({"message" : "*User doesn't exist, Kindly Register!"}) ,404
    if user.active == False:
        return jsonify({"message" : "Kindly wait for admin approval"}) ,404
    
    if verify_password(password ,user.password):    #password is from form and user. is from models
        return jsonify({'token': user.get_auth_token() ,'email' : user.email ,'role' : user.roles[0].name , 'id' :user.id})
    return jsonify({"message" : "*Invalid password or Username"}) ,400



@app.route('/register/professional', methods=['POST'])
def register_professional():
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    professional_experience = data.get('professional_experience')
    location_id = data.get('location_id')
    service_id = data.get('service_id')
    description = data.get('description')

    # Validate required fields
    if not email or not password or not professional_experience or not service_id or not location_id :
        return jsonify({"message": "Missing required fields for professional registration."}), 400

    # Check if the user already exists
    user = datastore.find_user(email=email)
    if user:
        return jsonify({"message": "User with this email already exists."}), 400


    # Manually create the user with custom fields
    new_user = datastore.create_user(
        email=email,
        password=hash_password(password),
        username=username,
        active=False,
        roles=['professional']
    )

    # Update additional fields manually
    new_user.professional_experience = professional_experience
    new_user.location_id = location_id
    new_user.service_id = service_id
    new_user.description = description

    db.session.commit()
    return jsonify({"message": f"Professional {username} registered successfully!"}), 201

  
@app.route('/register/customer', methods=['POST'])
def register_customer():
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    address = data.get('address')    
    location_id =data.get('location_id')
    preferred_contact = data.get('preferred_contact')

    # Validate required fields
    if not email or not password or not address or not preferred_contact or not location_id:
        return jsonify({"message": "Missing required fields for customer registration."}), 400

    # Check if the user already exists
    user = datastore.find_user(email=email)
    if user:
        return jsonify({"message": "User with this email already exists."}), 400

    try:
        # Create the user with default fields
        new_user = datastore.create_user(
            email=email,
            password=hash_password(password),
            username=username,
            active=True,
            roles=['customer']
        )

        # Update additional fields manually
        new_user.address = address
        new_user.location_id=location_id
        new_user.preferred_contact = preferred_contact

        db.session.commit()
        return jsonify({"message": f"Customer {username} registered successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error creating customer user: {str(e)}"}), 500



@app.get('/toggle/user/<int:user_id>') 
@auth_required("token")  
@roles_required("admin")  
def toggle_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    user.active = not user.active  # Toggle the active status
    db.session.commit()
    status = "activated" if user.active else "deactivated"
    return jsonify({"message": f"User {status} successfully"}), 200
