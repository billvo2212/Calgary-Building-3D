import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///urban_dashboard.db'
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
    CALGARY_API_BASE = "https://data.calgary.ca/resource/"