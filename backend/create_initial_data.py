from flask import current_app as app
from backend.models import *
from flask_security import SQLAlchemyUserDatastore , hash_password

with app.app_context():
    db.create_all()
    print("## Default data created if not exist ##")
    print("## Default data created if not exist ##")
    userdatastore : SQLAlchemyUserDatastore = app.security.datastore
    #creating initial roles
    userdatastore.find_or_create_role(name = 'admin', description = 'superuser')
    userdatastore.find_or_create_role(name = 'professional', description = 'technical service provider general user')
    userdatastore.find_or_create_role(name = 'customer', description = 'Customer general user')
    
    #creating initial users
    if (not userdatastore.find_user(email = 'admin@homebuddy.com')):
        userdatastore.create_user(email = 'admin@homebuddy.com', password = hash_password('pass'),username = 'admin' , roles = ['admin'] )
    if (not userdatastore.find_user(email = 'tech1@homebuddy.com')):
        userdatastore.create_user(email = 'tech1@homebuddy.com', password = hash_password('pass'),username = 'tech1' ,roles = ['professional'] ,location_id='1',service_id='1',active=1 ) # for testing
    if (not userdatastore.find_user(email = 'cust1@homebuddy.com')):
        userdatastore.create_user(email = 'cust1@homebuddy.com', password = hash_password('pass'),username = 'cust1' ,roles = ['customer'] ,location_id='1')
    
    # Create initial locations
    locations = ['Jumeirah', 'Business Bay', 'Silicon Oasis', 'DIP', 'JLT']
    for area in locations:
        if not Location.query.filter_by(area=area).first():
            db.session.add(Location(area=area))

    # Create initial services
    services = [
        {"name": "Laundry", "base_price": 50.0, "time_required": "2 hours", "description": "Professional laundry services."},
        {"name": "Gardening", "base_price": 100.0, "time_required": "3 hours", "description": "Gardening and landscaping services."},
        {"name": "Plumbing", "base_price": 75.0, "time_required": "2 hours", "description": "Expert plumbing repairs and installations."},
        {"name": "Cleaning", "base_price": 60.0, "time_required": "2 hours", "description": "Home and office cleaning services."},
    ]

    for service in services:
        if not Service.query.filter_by(name=service["name"]).first():
            db.session.add(Service(
                name=service["name"],
                base_price=service["base_price"],
                time_required=service["time_required"],
                description=service["description"]
            ))

    db.session.commit()