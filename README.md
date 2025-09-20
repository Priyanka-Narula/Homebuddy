
🔍 Home Buddy: Household Services Application

🧠 Project Goal

To create a comprehensive and user-friendly platform that connects clients with a wide range of household service providers. This project aims to simplify the process of booking, scheduling, and managing services, ensuring a seamless experience for both users and providers.

📊 Project Overview

This application serves as a centralized hub for household services. It allows users to browse service categories, find qualified professionals, and book appointments with ease. The system includes features for secure payments, provider ratings, and real-time tracking, building a reliable and trustworthy ecosystem for home service needs.

📁 Key Features

Service Listings: A categorized list of available services (e.g., plumbing, cleaning, electrical).

Provider Management: A robust system to manage and verify service providers.

Booking & Scheduling: Intuitive tools for booking appointments and managing schedules.

User and Provider Dashboards: Separate dashboards for clients and service providers to manage their activities.

Rating & Review System: A feedback mechanism to ensure quality control.

Real-time Tracking: The ability to monitor the status of a service request.

🔧⚙️ Technologies Used
Backend: Flask, SQLAlchemy, Redis, Celery

Frontend: HTML, CSS, Bootstrap, VueJS

Database: SQLite

Libraries: JWT for security, Flasgger for API documentation, ChartJS for data visualization

🛠️ Installation
Clone the repository:

git clone [https://github.com/Priyanka-Narula/Homebuddy.git](https://github.com/Priyanka-Narula/Homebuddy.git)
cd Homebuddy


Create a virtual environment:

python -m venv env
source env/bin/activate


Install the required packages:

pip install -r requirements.txt


Install Redis:
Follow the installation instructions on the official Redis website.

[https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)


Run Redis:

sudo service redis-server start


Run the application:

flask run


Run Celery worker in another window:

celery -A app.celery worker --loglevel=info


Run Celery beat in another window:

celery -A app.celery beat --loglevel=info

