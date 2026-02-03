const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: '8302', // Hardcoded for guaranteed connection
        database: process.env.DB_NAME || 'jaiho_news',
        port: process.env.DB_PORT || 3306
    });

    try {
        const username = 'admin';
        const password = 'admin123';
        const email = 'admin@jaihoindia.com';

        // Check if admin already exists
        const [rows] = await connection.execute('SELECT * FROM admins WHERE username = ?', [username]);

        if (rows.length > 0) {
            console.log('Admin user already exists. Updating password...');
            const hash = await bcrypt.hash(password, 10);
            await connection.execute('UPDATE admins SET password_hash = ? WHERE username = ?', [hash, username]);
            console.log('Admin password updated successfully.');
        } else {
            console.log('Creating new admin user...');
            const hash = await bcrypt.hash(password, 10);
            await connection.execute(
                'INSERT INTO admins (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
                [username, email, hash, 'Administrator', 'admin']
            );
            console.log('Admin user created successfully.');
        }

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await connection.end();
    }
}

createAdmin();
