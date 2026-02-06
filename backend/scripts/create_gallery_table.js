const { query } = require('../config/db');

const createGalleryTable = async () => {
    try {
        console.log('Creating gallery_images table...');

        const sql = `
            CREATE TABLE IF NOT EXISTS gallery_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image_url VARCHAR(500) NOT NULL,
                caption VARCHAR(255),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_uploaded_at (uploaded_at)
            ) ENGINE=InnoDB;
        `;

        await query(sql);
        console.log('✅ gallery_images table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create table:', error);
        process.exit(1);
    }
};

createGalleryTable();
