// controllers/contactController.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // SSL port
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
  }
});

transporter.verify((error, success) => {
  if (error) console.error('SMTP verification failed:', error);
  else console.log('SMTP ready:', success);
});

// Beautiful HTML email template
const createEmailTemplate = (userName, userEmail, subject, message) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Discussion Request</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; font-size: 28px; margin-bottom: 10px; }
        .header p { color: rgba(255,255,255,0.9); font-size: 16px; }
        .icon { width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px; }
        .content { padding: 40px 30px; }
        .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .info-box h3 { color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .info-box p { color: #666; font-size: 16px; line-height: 1.6; }
        .message-box { background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; }
        .message-box h3 { color: #333; margin-bottom: 15px; font-size: 18px; }
        .message-box p { color: #444; line-height: 1.8; font-size: 15px; white-space: pre-wrap; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
        .footer p { color: #999; font-size: 13px; }
        .badge { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">💬</div>
          <h1>New Discussion Request</h1>
          <p>Someone wants to connect with you!</p>
          <div class="badge">DSA RAG Chatbot</div>
        </div>
        
        <div class="content">
          <div class="info-box">
            <h3>From</h3>
            <p><strong>${userName}</strong></p>
            <p>${userEmail}</p>
          </div>
          
          <div class="info-box">
            <h3>Subject</h3>
            <p><strong>${subject}</strong></p>
          </div>
          
          <div class="message-box">
            <h3>📝 Message</h3>
            <p>${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 10px; text-align: center;">
            <p style="color: #1976d2; font-size: 14px; margin-bottom: 10px;">
              <strong>💡 Quick Reply Tip</strong>
            </p>
            <p style="color: #666; font-size: 13px;">
              Reply directly to <a href="mailto:${userEmail}" style="color: #667eea; text-decoration: none; font-weight: 600;">${userEmail}</a> to continue the conversation!
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent from DSA RAG Chatbot Discussion System</p>
          <p style="margin-top: 8px;">🚀 Powered by MERN Stack + AI</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// @desc    Send discussion email
// @route   POST /api/contact/discuss
// @access  Private
export const sendDiscussionEmail = async (req, res) => {
  try {
    const { subject, message, userName, userEmail } = req.body;

    // Validation
    if (!subject || !message) {
      return res.status(400).json({ 
        error: 'Subject and message are required' 
      });
    }

    // Email options
    const mailOptions = {
      from: `"DSA RAG Chatbot" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Send to admin
      replyTo: userEmail,
      subject: `[Discussion] ${subject}`,
      html: createEmailTemplate(userName, userEmail, subject, message),
      text: `New Discussion Request from ${userName} (${userEmail})\n\nSubject: ${subject}\n\nMessage:\n${message}`
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send confirmation to user
    const confirmationOptions = {
      from: `"DSA RAG Chatbot" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'We received your message! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; font-size: 28px; margin-bottom: 10px; }
            .icon { width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px; }
            .content { padding: 40px 30px; text-align: center; }
            .content h2 { color: #333; margin-bottom: 15px; }
            .content p { color: #666; line-height: 1.8; margin-bottom: 15px; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">✅</div>
              <h1>Message Received!</h1>
            </div>
            <div class="content">
              <h2>Thank you, ${userName}! 🎉</h2>
              <p>We've received your message about "<strong>${subject}</strong>" and we'll get back to you as soon as possible.</p>
              <p>Our team typically responds within 24-48 hours.</p>
              <p style="margin-top: 30px; color: #999; font-size: 14px;">Keep learning and coding! 💻</p>
            </div>
            <div class="footer">
              <p>DSA RAG Chatbot Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(confirmationOptions);

    res.json({ 
      success: true,
      message: 'Discussion request sent successfully' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send discussion request',
      message: error.message 
    });
  }
};