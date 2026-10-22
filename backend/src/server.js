require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` EventHub Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Base API URL: http://localhost:${PORT}/api/v1`);
    console.log(`====================================================`);
  });
};

startServer();
