const { refreshNewsCache } = require('../jobs/refreshJob');
require('dotenv').config({ path: '../.env' });

// Config needs to be loaded by the job, but we need to ensure env vars are present
console.log('🚀 Triggering Manual Refresh for Testing...');
refreshNewsCache().then(() => {
    console.log('✅ Manual refresh script finished.');
    process.exit(0);
});
