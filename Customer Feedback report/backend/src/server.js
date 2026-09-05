const app = require('./app');
const initDb = require('./database/initDb');
const seed = require('./database/seed');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await seed();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  FMS Customer Feedback & Critic Report Backend`);
      console.log(`  Running on http://localhost:${PORT}`);
      console.log(`  Admin Endpoints: http://localhost:${PORT}/api/reports/feedback/*`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start backend server:', err);
    process.exit(1);
  }
}

startServer();

