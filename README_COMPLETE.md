# Blood Bank and Donation Management System

A modern, full-stack blood bank management system built with Node.js, Express, MongoDB, and vanilla JavaScript with advanced features including Google Maps integration and email notifications.

## 🚀 Features

### For Donors
- User registration and authentication
- Blood donation scheduling
- Donation history tracking
- Eligibility checking
- Profile management
- Email notifications for donation reminders

### For Recipients
- Blood request submission
- Request status tracking
- Blood availability search
- Emergency contact management
- Email notifications for request approvals

### For Administrators
- Comprehensive dashboard with analytics
- User management (donors and recipients)
- Blood inventory management
- Donation and request approval
- Real-time statistics and charts
- Email notifications for low stock alerts
- Advanced reporting system

### Advanced Features
- **Google Maps Integration**: Find nearby blood banks with real-time directions
- **Email Notifications**: Automated email alerts using NodeMailer
- **Real-time Charts**: Interactive data visualization with Chart.js
- **Responsive Design**: Modern UI that works on all devices
- **Professional Dashboard**: Full-page tabbed interface for admin management

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB with Mongoose ODM
- **Charts**: Chart.js for data visualization
- **Maps**: Google Maps API for location services
- **Email**: NodeMailer for automated notifications
- **Styling**: Modern CSS with gradients, animations, and responsive design

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager
- Google Maps API key (for location features)
- Email service credentials (for notifications)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Blood-Bank-And-Donation-Management-System
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
MONGO_URI=mongodb://localhost:27017/blood_bank
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5000

# Google Maps API (for location services)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4. Database Setup
```bash
# From the project root
node setup.js
```

### 5. Start the Backend Server
```bash
cd backend
npm start
```

The server will start on `http://localhost:5000`

### 6. Access the Application
Open `http://localhost:5000` in your web browser.

## 👤 Default Admin Credentials
- **Email**: admin@bloodbank.com
- **Password**: admin123

## 📁 Project Structure

```
├── backend/
│   ├── controllers/     # Business logic
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── donorController.js
│   │   ├── recipientController.js
│   │   └── inventoryController.js
│   ├── middleware/      # Authentication & authorization
│   ├── models/         # Database models
│   │   ├── User.js
│   │   ├── Donation.js
│   │   ├── Request.js
│   │   └── Inventory.js
│   ├── routes/         # API routes
│   ├── services/       # External services
│   │   └── emailService.js
│   ├── app.js          # Main server file
│   └── package.json
├── frontend/
│   ├── admin/          # Admin dashboard
│   │   ├── dashboard.html
│   │   └── dashboard.js
│   ├── donor/          # Donor pages
│   │   ├── dashboard.html
│   │   ├── dashboard.js
│   │   └── register.html
│   ├── recipient/      # Recipient pages
│   │   ├── dashboard.html
│   │   ├── dashboard.js
│   │   └── register.html
│   ├── assets/         # CSS and JavaScript
│   │   ├── styles.css
│   │   └── script.js
│   ├── image/          # Images and assets
│   ├── index.html      # Landing page
│   ├── login.html      # Login page
│   └── register.html   # Registration page
├── sql/                # Legacy SQL files
└── setup.js           # Database initialization
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Admin Routes
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/recent-donations` - Recent donations
- `GET /api/admin/recent-requests` - Recent requests
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/donations/:id/status` - Update donation status
- `PUT /api/admin/requests/:id/status` - Update request status
- `GET /api/admin/reports/donations` - Donation reports
- `GET /api/admin/reports/requests` - Request reports
- `GET /api/admin/reports/inventory` - Inventory reports
- `GET /api/admin/reports/active-donors` - Active donors report
- `GET /api/admin/alerts/low-stock` - Low stock alerts
- `POST /api/admin/notifications/send` - Send notifications
- `GET /api/admin/notifications` - Get notifications

### Donor Routes
- `POST /api/donor/donate` - Submit donation
- `GET /api/donor/history` - Donation history
- `GET /api/donor/profile` - Get profile
- `PUT /api/donor/profile` - Update profile

### Recipient Routes
- `POST /api/recipient/request` - Submit blood request
- `GET /api/recipient/requests` - Get request history
- `GET /api/recipient/profile` - Get profile
- `PUT /api/recipient/profile` - Update profile

### Inventory Routes
- `GET /api/inventory` - Get blood inventory
- `PUT /api/inventory/:bloodType` - Update inventory
- `POST /api/inventory` - Add new inventory item

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🎨 UI/UX Features

### Modern Design
- Responsive design for all devices
- Professional gradient backgrounds
- Smooth animations and transitions
- Interactive charts and graphs
- Real-time data updates

### Admin Dashboard
- **Tabbed Interface**: Organized into Dashboard, Inventory, Users, Donations, Requests, Reports, and Notifications
- **Full-Page Layout**: Each tab takes full page space for better usability
- **Interactive Charts**: Large, professional blood inventory visualization
- **Real-time Statistics**: Live updates of system metrics
- **Advanced Filtering**: Search and filter capabilities for all data

### User Dashboards
- **Donor Dashboard**: Eligibility checking, donation scheduling, history tracking
- **Recipient Dashboard**: Blood requests, availability search, status tracking
- **Profile Management**: Easy profile updates and information management

### Home Page Features
- **Google Maps Integration**: Interactive map showing nearby blood banks
- **Hero Statistics**: Real-time system statistics
- **Smooth Scrolling**: Enhanced navigation experience
- **Contact Form**: Functional contact form with notifications
- **Professional Sections**: About, Services, Locations, Contact

## 📊 Advanced Features

### Google Maps Integration
- Interactive map with blood bank locations
- Custom markers for different facility types
- Search functionality for nearby locations
- Real-time directions and distance calculation

### Email Notifications
- **Donation Reminders**: Automated emails for scheduled donations
- **Request Approvals**: Notifications when blood requests are approved
- **Low Stock Alerts**: Critical inventory notifications
- **Welcome Emails**: New user onboarding
- **Custom Notifications**: Admin-sent messages

### Reporting System
- **Donation Reports**: Daily/weekly/monthly donation statistics
- **Request Reports**: Blood request analytics
- **Inventory Reports**: Stock level analysis
- **Active Donors Report**: Donor engagement metrics

### Real-time Features
- Live inventory updates
- Instant status changes
- Real-time notifications
- Dynamic chart updates

## 🚀 Deployment

### Local Development
1. Start MongoDB service
2. Configure environment variables
3. Run `npm start` in backend directory
4. Access application at `http://localhost:5000`

### Production Deployment
1. Set up MongoDB Atlas or production database
2. Configure production environment variables
3. Set up email service credentials
4. Obtain Google Maps API key
5. Deploy to hosting platform (Heroku, Render, etc.)

## 🔧 Configuration

### Email Setup
1. Create Gmail account or use existing email
2. Enable 2-factor authentication
3. Generate app password
4. Update `.env` file with credentials

### Google Maps Setup
1. Create Google Cloud project
2. Enable Maps JavaScript API
3. Generate API key
4. Update frontend with API key

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update connection string in `.env`
3. Run database initialization script

## 📈 Performance Features

- Optimized database queries
- Efficient caching strategies
- Responsive image loading
- Minified CSS and JavaScript
- CDN integration for external libraries

## 🔍 Search and Filter

- Blood type filtering
- Location-based search
- Date range filtering
- Status-based filtering
- Real-time search results

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Touch-friendly interfaces
- Responsive navigation
- Optimized for all screen sizes
- Progressive Web App features

## 🛡️ Error Handling

- Comprehensive error messages
- Graceful failure handling
- User-friendly error pages
- Logging and monitoring
- Data validation

## 🔄 Future Enhancements

- SMS notifications
- Mobile app development
- Advanced analytics dashboard
- Machine learning for demand prediction
- Integration with hospital systems
- Blockchain for donation tracking
- AI-powered matching system

## 📞 Support

For technical support or questions:
- Email: support@bloodbank.com
- Phone: +1 (555) 123-4567
- Documentation: Available in project wiki

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📊 System Requirements

- **Server**: Node.js 14+, MongoDB 4.4+
- **Client**: Modern web browser with JavaScript enabled
- **Network**: Internet connection for external APIs
- **Storage**: Minimum 100MB for application files

---

**Note**: This is a comprehensive blood bank management system designed for educational and demonstration purposes. For production use, additional security measures and compliance with healthcare regulations should be implemented. 