const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'rishith240@gmail.com' }).select('-password');
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log('Name:', adminUser.name);
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
      console.log('Created:', adminUser.createdAt);
    } else {
      console.log('No admin user found with email: rishith240@gmail.com');
    }

  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAdminUser(); 