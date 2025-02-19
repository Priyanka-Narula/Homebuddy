# Will use Simple Mail Transfer Protocol and my celery worker will run the app.py function and celery beat tell when to run the file and its scheduling 
# Will use Mail-Hog 
# To send request , 1025 | To conect smtp
# to see whats going on , go to 8025 

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


SMTP_SERVER = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = 'admin@homebuddy.com'
SENDER_PASSWORD = ''

def send_email(to, subject, content):

    msg = MIMEMultipart()
    msg['To'] = to
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL

    msg.attach(MIMEText(content,'html'))

    with smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT) as client:
        client.send_message(msg)
        client.quit()

#send_email('cust1@homebuddy.com', 'Test Email', '<h1> Welcome to Homebuddy </h1>')