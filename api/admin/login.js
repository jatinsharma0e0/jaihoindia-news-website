import { handleCors } from '../../lib/auth.js';
import { supabase } from '../../lib/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        const { data: admins, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .eq('is_active', true);

        if (error) throw error;
        if (!admins?.length) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const admin = admins[0];
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    full_name: admin.full_name,
                    role: admin.role,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
}
