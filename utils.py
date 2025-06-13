import sqlite3
import re
from urllib.parse import urlparse
from datetime import datetime
from flask import g
from app import app

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_url(url):
    """Validate URL format"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def validate_google_maps_url(url):
    """Validate Google Maps URL"""
    if not validate_url(url):
        return False
    
    parsed = urlparse(url)
    return 'google.com' in parsed.netloc or 'maps.google.com' in parsed.netloc or 'goo.gl' in parsed.netloc

def validate_future_date(date_str):
    """Validate that the date is in the future"""
    try:
        event_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        today = datetime.now().date()
        return event_date > today
    except:
        return False

def format_date(date_str):
    """Format date to DD/MM/YYYY"""
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        return date_obj.strftime('%d/%m/%Y')
    except:
        return date_str

def get_colleges():
    """Get list of eligible colleges"""
    return [
        "Indian Institute of Technology Madras, Chennai",
        "National Institute of Technology, Tiruchirappalli",
        "Vellore Institute of Technology, Vellore",
        "Anna University, Chennai",
        "PSG College of Technology, Coimbatore",
        "Thiagarajar College of Engineering (TCE), Madurai",
        "SRM Institute of Science and Technology, Chennai",
        "Amrita Vishwa Vidyapeetham, Coimbatore",
        "Shanmugha Arts Science Technology & Research Academy (SASTRA), Thanjavur",
        "Sri Sivasubramaniya Nadar College of Engineering (SSN), Kalavakkam"
    ]

def get_college_email_mapping():
    """Get mapping of colleges to their email suffixes"""
    return {
        "Indian Institute of Technology Madras, Chennai": "@smail.iitm.ac.in",
        "National Institute of Technology, Tiruchirappalli": "@nitt.edu",
        "Vellore Institute of Technology, Vellore": "@vitstudent.ac.in",
        "Anna University, Chennai": "@student.annauniv.edu",
        "PSG College of Technology, Coimbatore": "@psgtech.ac.in",
        "Thiagarajar College of Engineering (TCE), Madurai": "@student.tce.edu",
        "SRM Institute of Science and Technology, Chennai": "@srmuniv.edu.in",
        "Amrita Vishwa Vidyapeetham, Coimbatore": "@cb.students.amrita.edu",
        "Shanmugha Arts Science Technology & Research Academy (SASTRA), Thanjavur": "@sastra.ac.in",
        "Sri Sivasubramaniya Nadar College of Engineering (SSN), Kalavakkam": "@ssn.edu.in"
    }

def validate_email_college_match(email, college_name):
    """Validate that email suffix matches the selected college"""
    college_mapping = get_college_email_mapping()
    expected_suffix = college_mapping.get(college_name)
    
    if not expected_suffix:
        return False
    
    return email.lower().endswith(expected_suffix.lower())

def validate_password_strength(password):
    """Validate password strength (8+ chars, alphanumeric + special chars allowed)"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    has_letter = any(c.isalpha() for c in password)
    has_digit = any(c.isdigit() for c in password)
    
    if not (has_letter and has_digit):
        return False, "Password must contain at least one letter and one number"
    
    return True, "Password is valid"

def get_categories():
    """Get list of competition categories"""
    return [
        "Performing Arts",
        "Sports",
        "Academic",
        "Creative Arts",
        "Technology",
        "Business",
        "Cultural",
        "Culinary",
        "Environmental",
        "Public Speaking"
    ]

def sanitize_input(text):
    """Sanitize text input to prevent SQL injection"""
    if not text:
        return ""
    # Basic sanitization - remove potentially harmful characters
    dangerous_chars = ['<', '>', '"', "'", ';', '--', '/*', '*/', 'xp_', 'sp_']
    sanitized = str(text)
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '')
    return sanitized.strip()
