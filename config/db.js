const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolvers to handle SRV records reliably on Windows/corporate networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('DNS server override note:', dnsErr.message);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'pharmd_mentor',
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

