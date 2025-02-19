from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from flask_security.models import fsqla_v3 as fsq
from datetime import datetime as dt

# Initialize SQLAlchemy
db = SQLAlchemy()

# Integrate Flask-Security-Too with SQLAlchemy
fsq.FsModels.set_db_info(db)

# Role model
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

# UserRoles association table
class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

#class to show available locations of service
class Location(db.Model):
    id = db.Column(db.Integer , primary_key = True)
    area = db.Column(db.String , unique = True)    

# User model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean(), default=False)
    fs_uniquifier = db.Column(db.String(65), unique=True, nullable=False)

    # Custom fields for professionals and customers
    professional_experience = db.Column(db.String(255), nullable=True)  # Professionals
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=True)
    description = db.Column(db.String(255), nullable=True)             # Description for professionals
    address = db.Column(db.String(255), nullable=True)                 # Customers    
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False ,default='not specified')
    
    preferred_contact = db.Column(db.String(100), nullable=True)       # Customers
    last_login_at = db.Column(db.DateTime, default=dt.now() ,onupdate=dt.now())

    # Relationships
    roles = db.relationship('Role',backref='users',secondary='user_roles',lazy='select')

# Service model
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)  # e.g., "AC Servicing"
    base_price = db.Column(db.Float, nullable=False)               # Base price of the service
    time_required = db.Column(db.String(50), nullable=True)        # Estimated time, e.g., "2 hours"
    description = db.Column(db.String(255), nullable=True)         # Service description
    date_created = db.Column(db.DateTime, default=datetime.now() )
    date_updated = db.Column(db.DateTime, default=datetime.now() ,onupdate=datetime.now())
    flag = db.Column(db.Boolean, default=True)
  

# ServiceRequest model
class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Requesting customer
    professional_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True) #Assigned professional
    date_of_request = db.Column(db.Date)
    date_of_completion = db.Column(db.Date , nullable=True)  # Filled when completed
    remarks = db.Column(db.String(255), nullable=True)         # Comments or feedback
    service_status = db.Column(db.String(50),nullable=False,default='requested')  # Options: requested, assigned, completed, canceled

    # Relationships
    service = db.relationship('Service', backref='requests', lazy=True)
    customer = db.relationship('User', foreign_keys=[customer_id], backref='customer_requests', lazy=True)
    professional = db.relationship('User', foreign_keys=[professional_id], backref='professional_requests', lazy=True)

# Review model
class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_request_id = db.Column(db.Integer, db.ForeignKey('service_request.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # Out of 5
    comments = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now())

    # Relationships
    service_request = db.relationship('ServiceRequest', backref='reviews', lazy=True)

