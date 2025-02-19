import os
from flask import Flask
from backend.config import localDevelopmentConfig
from backend.models import db , User , Role
from backend.models import *
from flask_security import Security,SQLAlchemyUserDatastore , auth_required
from flask_caching import Cache
from backend.celery.celery_factory import celery_init_app
import flask_excel as excel


def createapp():
    app = Flask(__name__ ,template_folder='frontend', static_folder='frontend' , static_url_path= '/static/')  #changing the default template folder to 'frontend' thats where the index file will reside

    app.config.from_object(localDevelopmentConfig)
#cache init()
    cache=Cache(app)
    #flask-excel
    excel.init_excel(app)

     
    #model init
    db.init_app(app)  

    #flask security 
    datastore = SQLAlchemyUserDatastore(db , User , Role)
    app.cache = cache
    app.security = Security(app , datastore = datastore ,register_blueprint=False)#register_blueprint=False to disable the deafault login and register provided by flask security
    app.app_context().push()

    from backend.api import api   #shoud be imported after the app context is pushed
    #flask restfull init
    api.init_app(app)
    # Line 34-36 del , line 37 ok
    instance_path = os.path.join(app.instance_path, 'database.sqlite3')
    if not os.path.exists(instance_path):
        import backend.create_initial_data
    #import backend.create_initial_data 
    return app

app = createapp()
celery_app=celery_init_app(app)   #creating it in global context
import backend.celery.celery_schedule
#import backend.create_initial_data  

import backend.routes
if (__name__ == '__main__'): ## is only run when it is run from commamd line not by importing
    app.run(debug=True)

