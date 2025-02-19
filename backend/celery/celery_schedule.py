from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder
from backend.celery.tasks import *

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect  #its like a lifecycle hook
def setup_periodic_tasks(sender, **kwargs):
    # every 10 seconds
    #sender.add_periodic_task(10.0, email_reminder.s('customer@homebuddy.com', 'reminder to login', '<h1>Reminder!Please Visit the HomeBuddy </h1>') )
    
    # daily message at 6:55 pm, everyday
    sender.add_periodic_task(crontab(hour=18, minute=55), email_reminder.s('customer@homebuddy.com', 'reminder to login', '<h1>Reminder!Please Visit the HomeBuddy   </h1>'), name='daily reminder' )

    # weekly messages
    #sender.add_periodic_task(crontab(hour=18, minute=55, day_of_week='monday'), email_reminder.s('customer@homebuddy.com', 'reminder to login', '<h1> Reminder!Please Visit the HomeBuddy  </h1>'), name = 'weekly reminder' )
    
    #monthly report
    #sender.add_periodic_task(crontab(hour=18, minute=55, day_of_month='1'), email_reminder.s('customer@homebuddy.com', 'reminder to login', '<h1> Reminder!Please Visit the HomeBuddy  </h1>'), name = 'Monthly reminder' )
    sender.add_periodic_task(
        10, 
        send_daily_reminders.s(),  # Calls the task to send daily reminders
        name='Send daily login reminders'
    ),
    sender.add_periodic_task(10, send_monthly_reports.s(), name='Send monthly reports')

