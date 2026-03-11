import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'crm.db');

export const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database.');
});

export const initDb = () => {
    db.serialize(() => {
        // Table: Clients
        db.run(`CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            industry TEXT,
            contactEmail TEXT,
            status TEXT DEFAULT 'active',
            color TEXT,
            initials TEXT,
            customFields TEXT,
            notes TEXT,
            assignedUsers TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migration: Add customFields if it doesn't exist
        db.run(`ALTER TABLE clients ADD COLUMN notes TEXT`, (err) => {
            if (err) {
                // Column already exists, ignore
            }
        });

        db.run(`ALTER TABLE clients ADD COLUMN assignedUsers TEXT`, (err) => {
            if (err) {
                // Column already exists, ignore
            }
        });

        db.run(`ALTER TABLE users ADD COLUMN clientId TEXT`, (err) => {
            if (err) {
                // Column already exists, ignore
            }
        });

        db.run(`ALTER TABLE users ADD COLUMN permissions TEXT`, (err) => {
            if (err) {
                // Column already exists, ignore
            }
        });

        // Table: Integrations (Sources hooked up to clients)
        db.run(`CREATE TABLE IF NOT EXISTS integrations (
            id TEXT PRIMARY KEY,
            clientId TEXT NOT NULL,
            type TEXT NOT NULL,
            label TEXT,
            webhookKey TEXT UNIQUE,
            webhookUrl TEXT,
            platform TEXT,
            status TEXT DEFAULT 'connected',
            leadsTotal INTEGER DEFAULT 0,
            lastSync DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(clientId) REFERENCES clients(id)
        )`);

        // Table: Leads
        db.run(`CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            clientId TEXT NOT NULL,
            integrationId TEXT,
            fullName TEXT,
            email TEXT,
            phone TEXT,
            sourceType TEXT,
            sourceLabel TEXT,
            statusId TEXT DEFAULT 's1',
            temperature TEXT DEFAULT 'warm',
            customData TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(clientId) REFERENCES clients(id),
            FOREIGN KEY(integrationId) REFERENCES integrations(id)
        )`);

        // Table: Users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            initials TEXT,
            color TEXT,
            clientId TEXT,
            permissions TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, () => {
            // Seed base users if none exist
            db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
                if (row && row.count === 0) {
                    const pass = 'dsignxt123';
                    const perms = JSON.stringify(['dashboard', 'clients', 'leads', 'pipeline', 'integrations', 'analytics', 'team', 'settings']);
                    const users = [
                        ['u1', 'Suriya', 'suriya@dsignxt.com', pass, 'super_admin', 'S', '#6366f1', null, perms],
                        ['u2', 'Prasanth', 'prasanth@dsignxt.com', pass, 'admin', 'P', '#8b5cf6', null, perms],
                        ['u3', 'Viknesh', 'viknesh@dsignxt.com', pass, 'manager', 'V', '#ec4899', null, perms],
                        ['u4', 'Charan', 'charan@dsignxt.com', pass, 'executive', 'C', '#f59e0b', null, perms],
                        ['u5', 'Nivetha', 'nivetha@dsignxt.com', pass, 'executive', 'N', '#10b981', null, perms],
                        ['u6', 'Client User', 'client@vireka.in', pass, 'client', 'C', '#059669', 'c1', '[]'],
                    ];
                    users.forEach(u => {
                        db.run(`INSERT INTO users (id, name, email, password, role, initials, color, clientId, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, u);
                    });
                    console.log('✅ Base users seeded.');
                }
            });
        });
    });
};

// Helper for Promisified Queries
export const dbQuery = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});
export const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); });
});
export const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});
