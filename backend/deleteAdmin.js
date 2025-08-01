const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function deleteAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB');

    // Delete admin user
    const result = await User.deleteOne({ email: 'rishith240@gmail.com' });
    
    if (result.deletedCount > 0) {
      console.log('Admin user deleted successfully!');
    } else {
      console.log('No admin user found to delete');
    }

  } catch (error) {
    console.error('Error deleting admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

deleteAdminUser(); 