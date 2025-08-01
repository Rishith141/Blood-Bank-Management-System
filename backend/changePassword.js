require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  const [,, email, newPassword] = process.argv;
  if (!email || !newPassword) {
    console.error('Usage: node changePassword.js admin@example.com NewStrongP@ss!');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const hash = await bcrypt.hash(newPassword, 10);
    const result = await mongoose.connection.db
      .collection('users')
      .updateOne({ email }, { $set: { password: hash } });

    if (result.matchedCount === 0) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log(`Password updated for ${email}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

main();
