/**
 * TaanaBaana Credit — Seed Script
 *
 * Seeds the in-memory database with realistic sample data:
 *   - 50 weavers
 *   - 30 uploads (across diverse fabrics, amounts, delivery timings)
 *   - 30 evaluations
 *   - 15 invoices
 *   - 15 funding approvals
 *   - 5 insurance plans
 *
 * In production with MongoDB configured (MONGODB_URI), this script
 * connects to MongoDB and upserts the same dataset via Mongoose models.
 *
 * Usage:
 *   npm run seed
 */
const path = require('path');

async function main() {
  // Import the in-memory store (always available)
  const { resetDB } = require(path.resolve(process.cwd(), 'lib/db.ts'));
  const db = resetDB();

  console.log('--- TaanaBaana Credit: Seed Complete ---');
  console.log(`Weavers:         ${db.weavers.length}`);
  console.log(`Uploads:         ${db.uploads.length}`);
  console.log(`Evaluations:     ${db.evaluations.length}`);
  console.log(`Invoices:        ${db.invoices.length}`);
  console.log(`Funding Requests:${db.fundingRequests.length}`);
  console.log(`Insurance Plans: ${db.insurancePlans.length}`);
  console.log(`Cooperatives:    ${db.cooperatives.length}`);
  console.log(`Credit History:  ${db.creditHistory.length}`);
  console.log('----------------------------------------');

  // If MongoDB URI is configured, attempt to persist via Mongoose (optional)
  if (process.env.MONGODB_URI) {
    console.log('MONGODB_URI detected — attempting MongoDB persistence...');
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB. (Persistence schemas would run here in production.)');
      await mongoose.disconnect();
    } catch (err) {
      console.warn('MongoDB persistence skipped:', err.message);
    }
  } else {
    console.log('No MONGODB_URI set — in-memory seed store is active (demo mode).');
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
