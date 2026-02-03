const bcrypt = require('bcryptjs');

// Script to generate bcrypt hash for admin password
const password = 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }

    console.log('\n======================================');
    console.log('Admin Password Hash Generator');
    console.log('======================================');
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('======================================\n');
    console.log('Use this hash in your SQL INSERT statement:');
    console.log(`INSERT INTO admins (username, email, password_hash, full_name, role) VALUES ('admin', 'admin@jaihoindia.com', '${hash}', 'Administrator', 'admin');`);
    console.log('\n');
});
