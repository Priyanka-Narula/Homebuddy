class Config():
    Debug = False #Debug should be false to put this code to production
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False


class localDevelopmentConfig(Config): #localDevelopmentConfig inherits the features of Config class by passing in ()
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3"    #information about database name and type
    Debug = True
    SECURITY_PASSWORD_HASH = "bcrypt" #bcrypt is a algo for password hassing
    SECURITY_PASSWORD_SALT = "youaresupposedtobesecret" #gets added to the password and then encrypted 
    SECRET_KEY= "iamhidden"  #only for flask security to generate auth tokens not for passwords
    SECURITY_TOKEN_AUTHENTICATION_HEADER="Authentication-Token"
    WTF_CSRF_ENABLED = False  #to ensure that data comes back from same client to whom data was sent by sending a  token
    CACHE_TYPE ="RedisCache"
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT =6379
    

    