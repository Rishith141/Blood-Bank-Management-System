const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email templates
const emailTemplates = {
    donationReminder: (donorName, donationDate) => ({
        subject: 'Blood Donation Reminder',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #e74c3c; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">🩸 Blood Bank Management System</h1>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333;">Hello ${donorName},</h2>
                    <p style="color: #666; line-height: 1.6;">
                        This is a friendly reminder about your upcoming blood donation scheduled for 
                        <strong>${donationDate}</strong>.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #e74c3c; margin-top: 0;">Donation Preparation Tips:</h3>
                        <ul style="color: #666;">
                            <li>Get a good night's sleep</li>
                            <li>Eat a healthy meal before donation</li>
                            <li>Stay hydrated</li>
                            <li>Bring a valid ID</li>
                        </ul>
                    </div>
                    <p style="color: #666;">
                        Thank you for your commitment to saving lives through blood donation!
                    </p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                           style="background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                            Visit Our Website
                        </a>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 20px; text-align: center;">
                    <p style="margin: 0;">© 2024 Blood Bank Management System</p>
                </div>
            </div>
        `
    }),

    requestApproved: (recipientName, bloodType, units) => ({
        subject: 'Blood Request Approved',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #28a745; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">✅ Blood Request Approved</h1>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333;">Hello ${recipientName},</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Great news! Your blood request has been approved.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #28a745; margin-top: 0;">Request Details:</h3>
                        <p><strong>Blood Type:</strong> ${bloodType}</p>
                        <p><strong>Units:</strong> ${units}</p>
                        <p><strong>Status:</strong> <span style="color: #28a745;">Approved</span></p>
                    </div>
                    <p style="color: #666;">
                        Please contact us immediately to arrange pickup or delivery.
                    </p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                           style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                            View Details
                        </a>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 20px; text-align: center;">
                    <p style="margin: 0;">© 2024 Blood Bank Management System</p>
                </div>
            </div>
        `
    }),

    lowStockAlert: (bloodType, currentUnits) => ({
        subject: 'Low Stock Alert',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">⚠️ Low Stock Alert</h1>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333;">Urgent Notice</h2>
                    <p style="color: #666; line-height: 1.6;">
                        We are running low on ${bloodType} blood type.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #dc3545; margin-top: 0;">Current Stock:</h3>
                        <p><strong>Blood Type:</strong> ${bloodType}</p>
                        <p><strong>Available Units:</strong> ${currentUnits}</p>
                        <p><strong>Status:</strong> <span style="color: #dc3545;">Critical</span></p>
                    </div>
                    <p style="color: #666;">
                        Please encourage donors with ${bloodType} blood type to donate.
                    </p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                           style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                            View Inventory
                        </a>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 20px; text-align: center;">
                    <p style="margin: 0;">© 2024 Blood Bank Management System</p>
                </div>
            </div>
        `
    }),

    welcomeEmail: (userName, role) => ({
        subject: 'Welcome to Blood Bank Management System',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #e74c3c; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">🩸 Welcome to Blood Bank</h1>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333;">Hello ${userName},</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Welcome to the Blood Bank Management System! Thank you for joining our community.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #e74c3c; margin-top: 0;">Your Role: ${role}</h3>
                        <p style="color: #666;">
                            You can now access all features available for ${role}s in our system.
                        </p>
                    </div>
                    <p style="color: #666;">
                        If you have any questions, please don't hesitate to contact us.
                    </p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
                           style="background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                            Get Started
                        </a>
                    </div>
                </div>
                <div style="background: #333; color: white; padding: 20px; text-align: center;">
                    <p style="margin: 0;">© 2024 Blood Bank Management System</p>
                </div>
            </div>
        `
    })
};

// Email service functions
const emailService = {
    // Send email with template
    async sendEmail(to, templateName, data) {
        try {
            const template = emailTemplates[templateName];
            if (!template) {
                throw new Error(`Email template '${templateName}' not found`);
            }

            const emailContent = typeof template === 'function' ? template(data) : template;
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: to,
                subject: emailContent.subject,
                html: emailContent.html
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, error: error.message };
        }
    },

    // Send donation reminder
    async sendDonationReminder(donorEmail, donorName, donationDate) {
        return await this.sendEmail(donorEmail, 'donationReminder', { donorName, donationDate });
    },

    // Send request approval notification
    async sendRequestApproved(recipientEmail, recipientName, bloodType, units) {
        return await this.sendEmail(recipientEmail, 'requestApproved', { 
            recipientName, bloodType, units 
        });
    },

    // Send low stock alert
    async sendLowStockAlert(adminEmail, bloodType, currentUnits) {
        return await this.sendEmail(adminEmail, 'lowStockAlert', { bloodType, currentUnits });
    },

    // Send welcome email
    async sendWelcomeEmail(userEmail, userName, role) {
        return await this.sendEmail(userEmail, 'welcomeEmail', { userName, role });
    },

    // Send custom notification
    async sendCustomNotification(to, subject, message) {
        const customTemplate = {
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #e74c3c; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">🩸 Blood Bank Notification</h1>
                    </div>
                    <div style="padding: 30px; background: #f8f9fa;">
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            ${message}
                        </div>
                    </div>
                    <div style="background: #333; color: white; padding: 20px; text-align: center;">
                        <p style="margin: 0;">© 2024 Blood Bank Management System</p>
                    </div>
                </div>
            `
        };

        return await this.sendEmail(to, 'custom', { subject, message: customTemplate.html });
    }
};

module.exports = emailService; 