from flask import Flask, render_template, request, jsonify, url_for, redirect, send_from_directory, session
from flask_mail import Mail, Message
import os
import html
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Email
from flask_wtf.csrf import generate_csrf
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

#from logging import logger

app = Flask(__name__)
# === Gmail SMTP Configuration ===
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['EMAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

# Configure static files
app.static_folder = 'static'
app.template_folder = 'templates'

#Limiter config
limiter = Limiter(
    app=app,
    key_func=get_remote_address, 
    default_limits=["200 per day", "50 per hour"],
    strategy="fixed-window"
)

class ContactForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    message = TextAreaField('Message', validators=[DataRequired()])
    submit = SubmitField('Send')


@app.route("/robots.txt")
def robots():
    return send_from_directory("static", "robots.txt")

@app.route("/sitemap.xml")
def sitemap():
    return send_from_directory("static", "sitemap.xml")

@app.route('/')
def index():
    return render_template('index1.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/team')
def team():
    return render_template('team.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')


@app.route('/contact', methods=['GET', 'POST'])
@limiter.limit("5 per minute")   # allow 5 submissions per minute per IP
def contact_form():
    if request.method == 'POST':
        # Manually validate the CSRF token
        token = request.form.get('csrf_token')
        if not token or token != session.get('csrf_token'):
            # Handle invalid CSRF token (e.g., abort(400))
            pass

        form = ContactForm()
        if form.validate_on_submit():
            name = form.name.data
            email = form.email.data
            message = form.message.data

            msg = Message("New Contact Form Submission",
                sender=('Website Visitor', email),
                recipients=[app.config['MAIL_USERNAME']])
            #msg.body = f"Name: {name}\nEmail: {email}\nMessage: {message}"
            # Plain text version
            text_body = f"""
        New Contact Form Submission

        Name: {html.escape(name)}
        Email: {html.escape(email)}
        Message: {html.escape(message)}

        ---
        This email was sent from the IYAMOSA EMPIRE contact form.
            """
            
            # HTML version (sanitized)
            html_body = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #800020; color: #d4af37; padding: 20px; text-align: center; }}
                    .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
                    .field {{ margin-bottom: 15px; }}
                    .label {{ font-weight: bold; color: #800020; }}
                    .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>IYAMOSA EMPIRE</h1>
                        <p>New Contact Form Submission</p>
                    </div>
                    <div class="content">
                        <div class="field">
                            <span class="label">Name:</span> {html.escape(name)}
                        </div>
                        <div class="field">
                            <span class="label">Email:</span> {html.escape(email)}
                        </div>
                        <div class="field">
                            <span class="label">Message:</span><br>
                            {html.escape(message).replace(chr(10), '<br>')}
                        </div>
                    </div>
                    <div class="footer">
                        <p>This email was sent from the IYAMOSA EMPIRE contact form.</p>
                        <p>IP Hash: {html.escape(get_remote_address())}</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg.body = text_body
            msg.html = html_body
        
            mail.send(msg)

        csrf_token = generate_csrf()   # creates a new token and stores it in the session
        return redirect(url_for('index')), jsonify({'status': 'success', 'message': 'Thank you for your message!'}, csrf_token=csrf_token) 

#Error handlers
@app.errorhandler(403)
def forbidden(e):
    return render_template('error.html',
                           error_code=403,
                           error_message="Forbidden - Access Denied",
                           error_description="You don't have permission to access this resource."), 403

@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html',
                           error_code=404,
                           error_message="Page Not Found",
                           error_description="The page you're looking for doesn't exist or has been moved."), 404

@app.errorhandler(500)
def internal_error(e):
    # Log the error
    #logger.error(f"Internal server error: {str(e)}")
    return render_template('error.html',
                           error_code=500,
                           error_message="Internal Server Error",
                           error_description="Something went wrong on our end. Please try again later."), 500

@app.errorhandler(400)
def bad_request(e):
    return render_template('error.html',
                           error_code=400,
                           error_message="Bad Request",
                           error_description="The request could not be understood by the server."), 400

@app.errorhandler(405)
def method_not_allowed(e):
    return render_template('error.html',
                           error_code=405,
                           error_message="Method Not Allowed",
                           error_description="The method used to access this resource is not allowed."), 405


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

