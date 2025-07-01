from flask import render_template, request, redirect, url_for, session, flash, jsonify
from models import User, Event, init_db
from utils import (validate_email, validate_url, validate_google_maps_url, 
                  validate_future_date, format_date, get_colleges, get_categories, sanitize_input,
                  validate_email_college_match, validate_password_strength)
from app import app
import logging

# Initialize database on first import
init_db()

@app.before_request
def cleanup_past_events():
    """Clean up past events before each request"""
    Event.cleanup_past_events()

@app.route('/')
def index():
    """Redirect to login if not authenticated, otherwise to dashboard"""
    if 'user_id' in session:
        return redirect(url_for('view_events'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        email = sanitize_input(request.form.get('email', ''))
        password = request.form.get('password', '')
        
        if not email or not password:
            flash('Please provide both email and password', 'error')
            return render_template('login.html')
        
        if not validate_email(email):
            flash('Please provide a valid email address', 'error')
            return render_template('login.html')
        
        user = User.get_user_by_email(email)
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['user_name'] = user.full_name
            session['college_name'] = user.college_name
            flash('Login successful!', 'success')
            return redirect(url_for('view_events'))
        else:
            flash('Invalid email or password', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if request.method == 'POST':
        full_name = sanitize_input(request.form.get('full_name', ''))
        email = sanitize_input(request.form.get('email', ''))
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        college_name = request.form.get('college_name', '')
        
        # Validation
        if not all([full_name, email, password, confirm_password, college_name]):
            flash('All fields are required', 'error')
            return render_template('register.html', colleges=get_colleges())
        
        if not validate_email(email):
            flash('Please provide a valid email address', 'error')
            return render_template('register.html', colleges=get_colleges())
        
        if password != confirm_password:
            flash('Passwords do not match', 'error')
            return render_template('register.html', colleges=get_colleges())
        
        # Enhanced password validation
        is_valid_password, password_message = validate_password_strength(password)
        if not is_valid_password:
            flash(password_message, 'error')
            return render_template('register.html', colleges=get_colleges())
        
        if college_name not in get_colleges():
            flash('Please select a valid college', 'error')
            return render_template('register.html', colleges=get_colleges())
        
        # Validate email-college match
        if not validate_email_college_match(email, college_name):
            flash('Email domain does not match the selected college. Please verify your college selection and email address carefully.', 'error')
            return render_template('register.html', colleges=get_colleges())
        
        # Create user
        user_id = User.create_user(full_name, email, password, college_name)
        if user_id:
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Email already exists. Please use a different email.', 'error')
    
    return render_template('register.html', colleges=get_colleges())

@app.route('/logout')
def logout():
    """User logout"""
    session.clear()
    flash('You have been logged out successfully', 'info')
    return redirect(url_for('login'))

@app.route('/view_events')
def view_events():
    """View all events"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # Get filter parameters
    college_filter = request.args.get('college_filter')
    category_filter = request.args.getlist('category_filter')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    # Apply filters
    if any([college_filter, category_filter, date_from, date_to]):
        events = Event.filter_events(college_filter, category_filter, date_from, date_to)
    else:
        events = Event.get_all_events()
    
    # Format dates for display
    for event in events:
        event.formatted_date = format_date(event.event_date)
    
    return render_template('view_events.html', 
                         events=events, 
                         colleges=get_colleges(),
                         categories=get_categories(),
                         selected_college=college_filter,
                         selected_categories=category_filter,
                         date_from=date_from,
                         date_to=date_to)

@app.route('/search_events')
def search_events():
    """Search events"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    query = sanitize_input(request.args.get('q', ''))
    college_filter = request.args.get('college_filter')
    category_filter = request.args.getlist('category_filter')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    events = []
    
    # If there's a search query, start with search results
    if query:
        events = Event.search_events(query)
    else:
        # If no query but filters are applied, get all events
        if any([college_filter, category_filter, date_from, date_to]):
            events = Event.get_all_events()
    
    # Apply additional filters if any events exist
    if events and any([college_filter, category_filter, date_from, date_to]):
        filtered_events = []
        for event in events:
            include_event = True
            
            if college_filter and event.college_name != college_filter:
                include_event = False
            
            if category_filter and event.category not in category_filter:
                include_event = False
            
            if date_from and event.event_date < date_from:
                include_event = False
            
            if date_to and event.event_date > date_to:
                include_event = False
            
            if include_event:
                filtered_events.append(event)
        
        events = filtered_events
    
    # Format dates for display
    for event in events:
        event.formatted_date = format_date(event.event_date)
    
    return render_template('search_events.html', 
                         events=events, 
                         query=query,
                         colleges=get_colleges(),
                         categories=get_categories(),
                         selected_college=college_filter,
                         selected_categories=category_filter,
                         date_from=date_from,
                         date_to=date_to)

@app.route('/create_event', methods=['GET', 'POST'])
def create_event():
    """Create new event"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        # Get form data
        event_name = sanitize_input(request.form.get('event_name', ''))
        description = sanitize_input(request.form.get('description', ''))
        event_date = request.form.get('event_date', '')
        location = request.form.get('location', '')
        category = request.form.get('category', '')
        requirements = sanitize_input(request.form.get('requirements', ''))
        registration_link = request.form.get('registration_link', '')
        
        # Validation
        if not all([event_name, description, event_date, location, category, registration_link]):
            flash('All fields except requirements are mandatory', 'error')
            return render_template('create_event.html', categories=get_categories())
        
        if not validate_future_date(event_date):
            flash('Event date must be in the future', 'error')
            return render_template('create_event.html', categories=get_categories())
        
        if not validate_google_maps_url(location):
            flash('Please provide a valid Google Maps URL for location', 'error')
            return render_template('create_event.html', categories=get_categories())
        
        if not validate_url(registration_link):
            flash('Please provide a valid registration URL', 'error')
            return render_template('create_event.html', categories=get_categories())
        
        if category not in get_categories():
            flash('Please select a valid category', 'error')
            return render_template('create_event.html', categories=get_categories())
        
        # Create event
        event_id = Event.create_event(
            event_name, description, event_date, location, category,
            requirements, registration_link, session['user_id'], session['college_name']
        )
        
        if event_id:
            flash('Event created successfully!', 'success')
            return redirect(url_for('profile'))
        else:
            flash('Error creating event. Please try again.', 'error')
    
    return render_template('create_event.html', categories=get_categories())

@app.route('/edit_event/<int:event_id>', methods=['GET', 'POST'])
def edit_event(event_id):
    """Edit existing event"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    event = Event.get_event_by_id(event_id)
    if not event or event.user_id != session['user_id']:
        flash('Event not found or access denied', 'error')
        return redirect(url_for('profile'))
    
    if request.method == 'POST':
        # Get form data
        event_name = sanitize_input(request.form.get('event_name', ''))
        description = sanitize_input(request.form.get('description', ''))
        event_date = request.form.get('event_date', '')
        location = request.form.get('location', '')
        category = request.form.get('category', '')
        requirements = sanitize_input(request.form.get('requirements', ''))
        registration_link = request.form.get('registration_link', '')
        
        # Validation
        if not all([event_name, description, event_date, location, category, registration_link]):
            flash('All fields except requirements are mandatory', 'error')
            return render_template('edit_event.html', event=event, categories=get_categories())
        
        if not validate_future_date(event_date):
            flash('Event date must be in the future', 'error')
            return render_template('edit_event.html', event=event, categories=get_categories())
        
        if not validate_google_maps_url(location):
            flash('Please provide a valid Google Maps URL for location', 'error')
            return render_template('edit_event.html', event=event, categories=get_categories())
        
        if not validate_url(registration_link):
            flash('Please provide a valid registration URL', 'error')
            return render_template('edit_event.html', event=event, categories=get_categories())
        
        if category not in get_categories():
            flash('Please select a valid category', 'error')
            return render_template('edit_event.html', event=event, categories=get_categories())
        
        # Update event
        if Event.update_event(event_id, event_name, description, event_date, 
                            location, category, requirements, registration_link):
            flash('Event updated successfully!', 'success')
            return redirect(url_for('profile'))
        else:
            flash('Error updating event. Please try again.', 'error')
    
    return render_template('edit_event.html', event=event, categories=get_categories())

@app.route('/delete_event/<int:event_id>')
def delete_event(event_id):
    """Delete event"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    event = Event.get_event_by_id(event_id)
    if not event or event.user_id != session['user_id']:
        flash('Event not found or access denied', 'error')
        return redirect(url_for('profile'))
    
    if Event.delete_event(event_id):
        flash('Event deleted successfully!', 'success')
    else:
        flash('Error deleting event. Please try again.', 'error')
    
    return redirect(url_for('profile'))

@app.route('/profile')
def profile():
    """User profile - view my events"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    events = Event.get_events_by_user(session['user_id'])
    
    # Format dates for display
    for event in events:
        event.formatted_date = format_date(event.event_date)
    
    return render_template('profile.html', events=events)

@app.route('/delete_account', methods=['POST'])
def delete_account():
    """Delete user account"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    password = request.form.get('password', '')
    if not password:
        flash('Password is required to delete account', 'error')
        return redirect(url_for('profile'))
    
    user = User.get_user_by_id(session['user_id'])
    if not user or not user.check_password(password):
        flash('Invalid password', 'error')
        return redirect(url_for('profile'))
    
    if User.delete_user(session['user_id']):
        session.clear()
        flash('Account deleted successfully', 'success')
        return redirect(url_for('login'))
    else:
        flash('Error deleting account. Please try again.', 'error')
        return redirect(url_for('profile'))

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return render_template('500.html'), 500
