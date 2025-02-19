from celery import shared_task ,Celery
from datetime import datetime, timedelta
import flask_excel
from backend.models import ServiceRequest
from backend.models import *
from flask import current_app as app
from backend.celery.mail_service import send_email
import pandas as pd


'''
@shared_task(ignore_results = False)
def generate_csv():
    resource = ServiceRequest.query.all()

    column_names=[column.name for column in ServiceRequest.__table__.columns]
    csv_out = flask_excel.make_response_from_query_sets(resource,column_names  ,file_type='csv')

    with open('./backend/celery/user-downloads/servicerequest.csv' ,'wb') as file:
          #wb is write binary
        file.write(csv_out.data)
    return 'servicerequest.csv'
'''

@shared_task(ignore_results=False)
def generate_csv():
    
    resource = ServiceRequest.query.all()
    column_names = [column.name for column in ServiceRequest.__table__.columns]
    data = [[getattr(row, column) for column in column_names] for row in resource]
    df = pd.DataFrame(data, columns=column_names)
    file_path = './backend/celery/user-downloads/servicerequest.csv'
    df.to_csv(file_path, index=False)

    return 'servicerequest.csv'

    
    
@shared_task(ignore_result = True)
def email_reminder(to, subject, content):
    send_email(to, subject, content)


@shared_task(ignore_result=True)
def send_daily_reminders():
    yesterday = datetime.now() - timedelta(days=1)
    inactive_users = User.query.filter(User.last_login_at < yesterday).all()

    for user in inactive_users:
        subject = "We Miss You!"
        content = f"Hi {user.username},\n\nWe noticed you haven't logged in for a day. Check back to see what's new!"
        send_email(user.email, subject, content)
'''
# Sending email_remainders after every 2 minutes 
@shared_task(ignore_result=True)
def send_daily_reminders():
    two_minutes_ago = datetime.now() - timedelta(minutes=2)
    inactive_users = User.query.filter(User.last_login_at < two_minutes_ago).all()

    for user in inactive_users:
        subject = "We Miss You!"
        content = f"Hi {user.username},\n\nWe noticed you haven't logged in for a while. Check back to see what's new!"
        send_email(user.email, subject, content)
'''


@shared_task(ignore_result=True)
def send_monthly_reports():
    # Calculate the start and end of the last month
    today = datetime.now()
    first_day_last_month = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
    last_day_last_month = today.replace(day=1) - timedelta(days=1)

    users = User.query.all()

    for user in users:
        # Fetch all service requests by the user in the last month
        service_requests = ServiceRequest.query.filter(
            ServiceRequest.customer_id == user.id,
            ServiceRequest.date_of_request >= first_day_last_month,
            ServiceRequest.date_of_request <= last_day_last_month
        ).all()

        # Aggregate data
        total_services = len(service_requests)
        total_spent = sum([request.service.base_price for request in service_requests if request.service])
        reviews_left = Review.query.filter(
            Review.customer_id == user.id,
            Review.created_at >= first_day_last_month,
            Review.created_at <= last_day_last_month
        ).count()

        # Generate the HTML email content
        subject = "Your Monthly Service Report"
        content = f"""
        <html>
        <body>
            <p>Hi {user.username},</p>
            <p>Here’s your summary for the month:</p>
            <ul>
                <li><strong>Services Availed:</strong> {total_services}</li>
                <li><strong>Total Spent:</strong> ${total_spent:.2f}</li>
                <li><strong>Reviews Left:</strong> {reviews_left}</li>
            </ul>
            <p>Thank you for using our services! We look forward to serving you in the coming months.</p>
            <p>Best Regards,<br>HomeBuddy</p>
        </body>
        </html>
        """

        # Send the email (content will be in HTML)
        send_email(user.email, subject, content)
