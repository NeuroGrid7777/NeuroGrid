import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# SendGrid configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@neurogrid.ai")

async def send_welcome_email(to_email: str, user_name: str) -> bool:
    """Send welcome email to new subscriber"""
    if not SENDGRID_API_KEY:
        logger.warning("SendGrid API key not configured")
        return False
    
    try:
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject="Welcome to NeuroGrid AI! 🚀",
            html_content=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to NeuroGrid AI</h1>
                    <p style="color: #e0e0e0; margin: 10px 0 0 0;">Neural Intelligence • Infinite Possibilities</p>
                </div>
                
                <div style="padding: 40px; background: #f8f9fa;">
                    <h2 style="color: #333; margin-bottom: 20px;">Hi {user_name}! 👋</h2>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        Welcome to the future of AI automation! You've just joined an exclusive community of 
                        innovators who are transforming their businesses with neural networks and quantum processing.
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #4f46e5; margin-top: 0;">What's next?</h3>
                        <ul style="color: #555; line-height: 1.8;">
                            <li>🧠 Explore our Neural Labs for cutting-edge AI courses</li>
                            <li>⚡ Access quantum-speed automation templates</li>
                            <li>🚀 Join weekly workshops with AI specialists</li>
                            <li>💡 Get personalized AI strategy consultations</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://neurogrid.ai/neural-labs" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; padding: 15px 30px; text-decoration: none; 
                                  border-radius: 25px; font-weight: bold; display: inline-block;">
                            Explore Neural Labs →
                        </a>
                    </div>
                    
                    <p style="color: #777; font-size: 14px; margin-top: 30px;">
                        Questions? Reply to this email or visit our Neural Support center.
                    </p>
                </div>
                
                <div style="background: #333; padding: 20px; text-align: center;">
                    <p style="color: #ccc; margin: 0; font-size: 12px;">
                        © 2025 NeuroGrid AI. Pioneering the future of artificial intelligence.
                    </p>
                </div>
            </div>
            """
        )
        
        sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
        response = sg.send(message)
        
        logger.info(f"Welcome email sent to {to_email}, status: {response.status_code}")
        return response.status_code == 202
        
    except Exception as e:
        logger.error(f"Failed to send welcome email to {to_email}: {e}")
        return False

async def send_verification_email(to_email: str, verification_token: str) -> bool:
    """Send email verification"""
    if not SENDGRID_API_KEY:
        return False
    
    try:
        verification_url = f"https://neurogrid.ai/verify-email?token={verification_token}"
        
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject="Verify Your NeuroGrid AI Account",
            html_content=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
                </div>
                
                <div style="padding: 40px; background: #f8f9fa;">
                    <p style="color: #555; line-height: 1.6;">
                        Please click the button below to verify your email address and activate your NeuroGrid AI account:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verification_url}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; padding: 15px 30px; text-decoration: none; 
                                  border-radius: 25px; font-weight: bold; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <p style="color: #777; font-size: 14px;">
                        If you didn't create an account with NeuroGrid AI, you can safely ignore this email.
                    </p>
                </div>
            </div>
            """
        )
        
        sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
        response = sg.send(message)
        
        return response.status_code == 202
        
    except Exception as e:
        logger.error(f"Failed to send verification email to {to_email}: {e}")
        return False

async def send_booking_confirmation(
    to_email: str, 
    user_name: str, 
    preferred_date: str, 
    booking_type: str
) -> bool:
    """Send booking confirmation email"""
    if not SENDGRID_API_KEY:
        return False
    
    try:
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject="Neural Labs Consultation Booking Confirmed! 🎯",
            html_content=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Booking Confirmed</h1>
                    <p style="color: #e0e0e0; margin: 10px 0 0 0;">Your Neural Intelligence session is scheduled</p>
                </div>
                
                <div style="padding: 40px; background: #f8f9fa;">
                    <h2 style="color: #333;">Hi {user_name}! 🚀</h2>
                    
                    <p style="color: #555; line-height: 1.6;">
                        Great news! Your {booking_type} consultation has been scheduled. Our AI specialists 
                        will contact you within 24 hours to confirm the exact time and provide meeting details.
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                        <h3 style="color: #4f46e5; margin-top: 0;">Booking Details</h3>
                        <p style="margin: 5px 0;"><strong>Type:</strong> {booking_type.title()} Session</p>
                        <p style="margin: 5px 0;"><strong>Preferred Date:</strong> {preferred_date}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> Pending Confirmation</p>
                    </div>
                    
                    <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="color: #0277bd; margin-top: 0;">💡 Prepare for Your Session</h4>
                        <ul style="color: #333; line-height: 1.6;">
                            <li>Review your current business processes</li>
                            <li>Identify repetitive tasks for automation</li>
                            <li>Prepare questions about AI implementation</li>
                            <li>Consider your data sources and workflows</li>
                        </ul>
                    </div>
                    
                    <p style="color: #777; font-size: 14px; margin-top: 30px;">
                        Questions? Reply to this email or contact our Neural Support team.
                    </p>
                </div>
            </div>
            """
        )
        
        sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
        response = sg.send(message)
        
        return response.status_code == 202
        
    except Exception as e:
        logger.error(f"Failed to send booking confirmation to {to_email}: {e}")
        return False

async def send_course_completion_email(to_email: str, user_name: str, course_title: str) -> bool:
    """Send course completion congratulations email"""
    if not SENDGRID_API_KEY:
        return False
    
    try:
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject=f"🎉 Congratulations! You completed {course_title}",
            html_content=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🎉 Course Completed!</h1>
                    <p style="color: #d1fae5; margin: 10px 0 0 0;">Neural mastery unlocked</p>
                </div>
                
                <div style="padding: 40px; background: #f8f9fa;">
                    <h2 style="color: #333;">Congratulations {user_name}! 🚀</h2>
                    
                    <p style="color: #555; line-height: 1.6;">
                        You've successfully completed <strong>{course_title}</strong>! Your neural intelligence 
                        has been upgraded and you're now equipped with cutting-edge AI automation skills.
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #10b981; margin-top: 0;">🏆 What You've Achieved</h3>
                        <ul style="color: #555; line-height: 1.8;">
                            <li>✅ Mastered advanced AI automation techniques</li>
                            <li>✅ Gained access to neural network templates</li>
                            <li>✅ Completed hands-on practical exercises</li>
                            <li>✅ Earned NeuroGrid AI certification</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://neurogrid.ai/certificate" 
                           style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                                  color: white; padding: 15px 30px; text-decoration: none; 
                                  border-radius: 25px; font-weight: bold; display: inline-block;">
                            Download Certificate 📜
                        </a>
                    </div>
                    
                    <p style="color: #777; font-size: 14px;">
                        Ready for the next level? Explore our advanced Neural Labs courses!
                    </p>
                </div>
            </div>
            """
        )
        
        sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
        response = sg.send(message)
        
        return response.status_code == 202
        
    except Exception as e:
        logger.error(f"Failed to send completion email to {to_email}: {e}")
        return False