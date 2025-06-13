import sqlite3
import hashlib
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from utils import get_db_connection

class User:
    def __init__(self, id=None, full_name=None, email=None, password_hash=None, college_name=None, created_at=None):
        self.id = id
        self.full_name = full_name
        self.email = email
        self.password_hash = password_hash
        self.college_name = college_name
        self.created_at = created_at

    @staticmethod
    def create_table():
        """Create the users table if it doesn't exist"""
        conn = get_db_connection()
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                college_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

    @staticmethod
    def create_user(full_name, email, password, college_name):
        """Create a new user"""
        conn = get_db_connection()
        password_hash = generate_password_hash(password)
        
        try:
            cursor = conn.execute(
                'INSERT INTO users (full_name, email, password_hash, college_name) VALUES (?, ?, ?, ?)',
                (full_name, email, password_hash, college_name)
            )
            conn.commit()
            user_id = cursor.lastrowid
            conn.close()
            return user_id
        except sqlite3.IntegrityError:
            conn.close()
            return None

    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        conn = get_db_connection()
        user_data = conn.execute(
            'SELECT * FROM users WHERE email = ?', (email,)
        ).fetchone()
        conn.close()
        
        if user_data:
            return User(
                id=user_data['id'],
                full_name=user_data['full_name'],
                email=user_data['email'],
                password_hash=user_data['password_hash'],
                college_name=user_data['college_name'],
                created_at=user_data['created_at']
            )
        return None

    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        conn = get_db_connection()
        user_data = conn.execute(
            'SELECT * FROM users WHERE id = ?', (user_id,)
        ).fetchone()
        conn.close()
        
        if user_data:
            return User(
                id=user_data['id'],
                full_name=user_data['full_name'],
                email=user_data['email'],
                password_hash=user_data['password_hash'],
                college_name=user_data['college_name'],
                created_at=user_data['created_at']
            )
        return None

    def check_password(self, password):
        """Check if password matches"""
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def delete_user(user_id):
        """Delete user and all their events"""
        conn = get_db_connection()
        try:
            # Delete user's events first
            conn.execute('DELETE FROM events WHERE user_id = ?', (user_id,))
            # Delete user
            conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
            conn.commit()
            conn.close()
            return True
        except:
            conn.close()
            return False

class Event:
    def __init__(self, id=None, event_name=None, description=None, event_date=None, 
                 location=None, category=None, requirements=None, registration_link=None,
                 user_id=None, college_name=None, created_at=None):
        self.id = id
        self.event_name = event_name
        self.description = description
        self.event_date = event_date
        self.location = location
        self.category = category
        self.requirements = requirements
        self.registration_link = registration_link
        self.user_id = user_id
        self.college_name = college_name
        self.created_at = created_at

    @staticmethod
    def create_table():
        """Create the events table if it doesn't exist"""
        conn = get_db_connection()
        conn.execute('''
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_name TEXT NOT NULL,
                description TEXT NOT NULL,
                event_date DATE NOT NULL,
                location TEXT NOT NULL,
                category TEXT NOT NULL,
                requirements TEXT,
                registration_link TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                college_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        conn.commit()
        conn.close()

    @staticmethod
    def create_event(event_name, description, event_date, location, category, 
                    requirements, registration_link, user_id, college_name):
        """Create a new event"""
        conn = get_db_connection()
        try:
            cursor = conn.execute('''
                INSERT INTO events (event_name, description, event_date, location, 
                                  category, requirements, registration_link, user_id, college_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (event_name, description, event_date, location, category, 
                  requirements, registration_link, user_id, college_name))
            conn.commit()
            event_id = cursor.lastrowid
            conn.close()
            return event_id
        except:
            conn.close()
            return None

    @staticmethod
    def get_all_events():
        """Get all future events"""
        conn = get_db_connection()
        events_data = conn.execute('''
            SELECT * FROM events 
            WHERE event_date >= date('now') 
            ORDER BY event_date ASC
        ''').fetchall()
        conn.close()
        
        events = []
        for event_data in events_data:
            events.append(Event(
                id=event_data['id'],
                event_name=event_data['event_name'],
                description=event_data['description'],
                event_date=event_data['event_date'],
                location=event_data['location'],
                category=event_data['category'],
                requirements=event_data['requirements'],
                registration_link=event_data['registration_link'],
                user_id=event_data['user_id'],
                college_name=event_data['college_name'],
                created_at=event_data['created_at']
            ))
        return events

    @staticmethod
    def get_events_by_user(user_id):
        """Get all events created by a specific user"""
        conn = get_db_connection()
        events_data = conn.execute('''
            SELECT * FROM events 
            WHERE user_id = ? AND event_date >= date('now')
            ORDER BY event_date ASC
        ''', (user_id,)).fetchall()
        conn.close()
        
        events = []
        for event_data in events_data:
            events.append(Event(
                id=event_data['id'],
                event_name=event_data['event_name'],
                description=event_data['description'],
                event_date=event_data['event_date'],
                location=event_data['location'],
                category=event_data['category'],
                requirements=event_data['requirements'],
                registration_link=event_data['registration_link'],
                user_id=event_data['user_id'],
                college_name=event_data['college_name'],
                created_at=event_data['created_at']
            ))
        return events

    @staticmethod
    def get_event_by_id(event_id):
        """Get event by ID"""
        conn = get_db_connection()
        event_data = conn.execute(
            'SELECT * FROM events WHERE id = ?', (event_id,)
        ).fetchone()
        conn.close()
        
        if event_data:
            return Event(
                id=event_data['id'],
                event_name=event_data['event_name'],
                description=event_data['description'],
                event_date=event_data['event_date'],
                location=event_data['location'],
                category=event_data['category'],
                requirements=event_data['requirements'],
                registration_link=event_data['registration_link'],
                user_id=event_data['user_id'],
                college_name=event_data['college_name'],
                created_at=event_data['created_at']
            )
        return None

    @staticmethod
    def search_events(query):
        """Search events by name"""
        conn = get_db_connection()
        events_data = conn.execute('''
            SELECT * FROM events 
            WHERE event_name LIKE ? AND event_date >= date('now')
            ORDER BY event_date ASC
        ''', (f'%{query}%',)).fetchall()
        conn.close()
        
        events = []
        for event_data in events_data:
            events.append(Event(
                id=event_data['id'],
                event_name=event_data['event_name'],
                description=event_data['description'],
                event_date=event_data['event_date'],
                location=event_data['location'],
                category=event_data['category'],
                requirements=event_data['requirements'],
                registration_link=event_data['registration_link'],
                user_id=event_data['user_id'],
                college_name=event_data['college_name'],
                created_at=event_data['created_at']
            ))
        return events

    @staticmethod
    def filter_events(college_filter=None, category_filter=None, date_from=None, date_to=None):
        """Filter events based on criteria"""
        conn = get_db_connection()
        
        query = 'SELECT * FROM events WHERE event_date >= date("now")'
        params = []
        
        if college_filter:
            query += ' AND college_name = ?'
            params.append(college_filter)
        
        if category_filter:
            placeholders = ','.join(['?' for _ in category_filter])
            query += f' AND category IN ({placeholders})'
            params.extend(category_filter)
        
        if date_from:
            query += ' AND event_date >= ?'
            params.append(date_from)
            
        if date_to:
            query += ' AND event_date <= ?'
            params.append(date_to)
        
        query += ' ORDER BY event_date ASC'
        
        events_data = conn.execute(query, params).fetchall()
        conn.close()
        
        events = []
        for event_data in events_data:
            events.append(Event(
                id=event_data['id'],
                event_name=event_data['event_name'],
                description=event_data['description'],
                event_date=event_data['event_date'],
                location=event_data['location'],
                category=event_data['category'],
                requirements=event_data['requirements'],
                registration_link=event_data['registration_link'],
                user_id=event_data['user_id'],
                college_name=event_data['college_name'],
                created_at=event_data['created_at']
            ))
        return events

    @staticmethod
    def update_event(event_id, event_name, description, event_date, location, 
                    category, requirements, registration_link):
        """Update an existing event"""
        conn = get_db_connection()
        try:
            conn.execute('''
                UPDATE events 
                SET event_name = ?, description = ?, event_date = ?, location = ?,
                    category = ?, requirements = ?, registration_link = ?
                WHERE id = ?
            ''', (event_name, description, event_date, location, category, 
                  requirements, registration_link, event_id))
            conn.commit()
            conn.close()
            return True
        except:
            conn.close()
            return False

    @staticmethod
    def delete_event(event_id):
        """Delete an event"""
        conn = get_db_connection()
        try:
            conn.execute('DELETE FROM events WHERE id = ?', (event_id,))
            conn.commit()
            conn.close()
            return True
        except:
            conn.close()
            return False

    @staticmethod
    def cleanup_past_events():
        """Delete events that have passed"""
        conn = get_db_connection()
        try:
            conn.execute('DELETE FROM events WHERE event_date < date("now")')
            conn.commit()
            conn.close()
            return True
        except:
            conn.close()
            return False

# Initialize database tables
def init_db():
    User.create_table()
    Event.create_table()
