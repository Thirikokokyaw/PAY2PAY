const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
// 💡 FIXED: Added execFile to destructuring imports to prevent crashing on /status-check
const { exec, execFile } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());

// PROFILE PHOTO BASE64 SIZE LIMIT 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// XAMPP MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'pay2pay_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to XAMPP MySQL Database.');
});

// 🔐 Helper function to call COBOL Authentication Validator
const callCobolValidator = (action, name, phone, email, password) => {
    return new Promise((resolve, reject) => {
        const args = `${action},${name || ''},${phone || ''},${email || ''},${password || ''}`;
        const cobolPath = path.join(__dirname, 'auth.exe');

        console.log(`Executing Auth Validator: "${cobolPath}" "${args}"`);

        exec(`"${cobolPath}" "${args}"`, (error, stdout, stderr) => {
            if (error) {
                console.error("COBOL Execution Error Detail:", error.message);
                reject(`COBOL Execution Error: ${error.message}`);
                return;
            }
            const result = stdout.trim().split('|');
            resolve({
                status: result[0] ? result[0].trim() : 'ERROR',
                message: result[1] ? result[1].trim() : 'Unknown validation error.'
            });
        });
    });
};

// 💡 Helper Function to call COBOL Exchange Validator (Comma Separated Delimiter)
const callExchangeValidator = (action, amount, txnTail, sender, receiver) => {
    return new Promise((resolve, reject) => {
        const args = `${action},${amount},${txnTail},${sender},${receiver}`;
        const cobolPath = path.join(__dirname, 'exchangeform.exe');

        console.log(`Executing Exchange Validator: "${cobolPath}" with args: ${args}`);

        exec(`"${cobolPath}" ${args}`, (error, stdout, stderr) => {
            if (error) {
                console.error("COBOL Exchange Error:", error.message);
                reject(`COBOL Execution Error: ${error.message}`);
                return;
            }
            const result = stdout.trim().split('|');
            resolve({
                status: result[0] ? result[0].trim() : 'ERROR',
                message: result[1] ? result[1].trim() : 'Unknown validation error.'
            });
        });
    });
};

// ─── FETCH LIVE WALLET STATUSES & RESERVES ROUTE ───
app.get('/api/wallets', (req, res) => {
    db.query('SELECT * FROM WALLETS', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const walletMap = {};
        results.forEach(row => {
            walletMap[row.wallet_id] = {
                label: row.wallet_name,
                balance: parseFloat(row.current_balance),
                active: row.is_active === 'Y'
            };
        });
        res.json(walletMap); 
    });
});

// ───  SUBMIT EXCHANGE TRANSACTION DATA ROUTE (POST Method) ───
app.post('/api/exchange/submit', async (req, res) => {
    const { fromWallet, toWallet, amount, txnIdTail, senderPhone, receiverPhone, senderName, receiverName, userId } = req.body;

    if (!fromWallet || !toWallet || amount === undefined || amount === null || !txnIdTail || !senderPhone || !receiverPhone) {
        return res.status(400).json({ success: false, message: "Missing required tracking arguments inside payload body structure." });
    }

    const finalUserId = userId || 1; 
    const sendAmount = Number(amount);
    const receiveAmount = sendAmount * 0.98; 

    try {
        const cobolRes = await callExchangeValidator('VALIDATE_TXN', sendAmount, txnIdTail, senderPhone, receiverPhone);
        
        if (cobolRes.status === 'ERROR') {
            return res.status(400).json({ success: false, message: cobolRes.message });
        }

        const sqlQuery = `
            INSERT INTO EXCHANGE_TRANSACTIONS (
                user_id, from_wallet, to_wallet, send_amount, receive_amount, 
                txn_id_tail, sender_name, sender_phone, receiver_name, receiver_phone, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '0')
        `;

        const queryValues = [
            finalUserId, fromWallet, toWallet, sendAmount, receiveAmount,
            txnIdTail, senderName || 'N/A', senderPhone, receiverName || 'N/A', receiverPhone
        ];

        db.query(sqlQuery, queryValues, (dbErr, dbResult) => {
            if (dbErr) {
                console.error("MySQL Insertion Failed:", dbErr);
                return res.status(500).json({ success: false, message: "Failed to store inside ledger database table." });
            }
            return res.status(200).json({ 
                success: true, 
                message: "Transaction authorized and archived inside SQL ledger table successfully!" 
            });
        });

    } catch (error) {
        console.error("COBOL Execution Flow Catch Block Error:", error);
        res.status(500).json({ success: false, message: "Internal validation process runtime failure." });
    }
});

// ─── REGISTER ROUTE ───
app.post('/api/register', async (req, res) => {
    const { name, phone, email, password } = req.body;

    try {
        const cobolRes = await callCobolValidator('REGISTER', name, phone, email, password);
        if (cobolRes.status === 'ERROR') {
            return res.status(400).json({ message: cobolRes.message });
        }

        db.query('SELECT email FROM users WHERE email = ?', [email], (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (results.length > 0) {
                return res.status(400).json({ message: 'Email already registered.' });
            }

            const defaultPhoto = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';
            const userRole = 'user';

            const sql = 'INSERT INTO users (name, phone, email, password, role, profile_photo) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(sql, [name, phone, email, password, userRole, defaultPhoto], (err, result) => {
                if (err) return res.status(500).json({ message: 'Registration failed.' });
                res.status(201).json({ message: 'Registration successful! Please login.' });
            });
        });

    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// ─── LOGIN ROUTE ───
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT id, name, phone, email, password, role, status, isBlacklisted FROM users WHERE email = ?`;
    
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(400).json({ message: "User not found" });

        const user = results[0];

        if (user.isBlacklisted === 1) {
            return res.status(403).json({ message: "Blacklisted Account" });
        }

        if (user.password !== password) { 
            return res.status(400).json({ message: "Invalid password" });
        }

        res.status(200).json({
            role: user.role,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                status: user.status,          
                isBlacklisted: user.isBlacklisted
            }
        });
    });
});

// ─── UPDATE PROFILE ROUTE ───
app.post('/api/profile/update', async (req, res) => {
    const { name, phone, email, avatar, currentEmail } = req.body;

    try {
        const cobolRes = await callCobolValidator('UPDATE', name, phone, email, '');
        if (cobolRes.status === 'ERROR') {
            return res.status(400).json({ success: false, message: cobolRes.message });
        }

        const sql = 'UPDATE users SET name = ?, phone = ?, email = ?, profile_photo = ? WHERE email = ?';
        db.query(sql, [name, phone, email, avatar, currentEmail || email], (err, result) => {
            if (err) {
                console.error("DB Update Error:", err);
                return res.status(500).json({ success: false, message: 'Database update failed.' });
            }

            res.status(200).json({ 
                success: true, 
                message: 'Profile updated successfully!', 
                user: { name, phone, email, avatar: avatar, photo: avatar } 
            });
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message || error });
    }
});

// ─── TICKET SUBMIT ROUTE ───
app.post('/api/tickets/submit', async (req, res) => {
    const { fromPay, toPay, txnNo, message } = req.body;

    try {
        const cobolRes = await callCobolValidator('SUPPORT', message, txnNo, '', '');
        if (cobolRes.status === 'ERROR') {
            return res.status(400).json({ success: false, message: cobolRes.message });
        }

        const newTicketId = "TKT-" + Math.floor(10000 + Math.random() * 90000);
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
        
        const newTicket = {
            id: newTicketId,
            route: `${fromPay} ➔ ${toPay}`,
            txn: txnNo || "N/A",
            userMsg: message,
            sysReply: `We receive your ticket for the ${fromPay} to ${toPay} transfer. Our team fixes it now.`,
            status: "Open",
            time: timestamp
        };

        res.status(200).json({ success: true, message: `Ticket ${newTicketId} created!`, ticket: newTicket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || error });
    }
});

// ───  ADMIN TRANSACTION APPROVAL ROUTE ───
app.post('/api/admin/approve-transaction', async (req, res) => {
    const { transactionId, amount, txnIdTail, sender, receiver, toWallet } = req.body;
    const cobolPath = path.join(__dirname, 'approve_txn.exe');
    const args = `APPROVE,${amount},${txnIdTail},${sender},${receiver}`;

    exec(`"${cobolPath}" "${args}"`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ message: "COBOL Approval Error" });

        const result = stdout.trim().split('|');
        if (result[0] === 'ERROR') {
            return res.status(400).json({ message: result[1] });
        }

        db.query(
            'UPDATE WALLETS SET current_balance = current_balance - ? WHERE wallet_id = ?',
            [amount, toWallet],
            (dbErr, dbRes) => {
                if (dbErr) return res.status(500).json({ message: "Database Update Failed" });
                
                db.query('UPDATE EXCHANGE_TRANSACTIONS SET status = "1" WHERE txn_id = ?', [transactionId], (statusErr) => {
                    if (statusErr) console.error("Status Update Failed", statusErr);
                    res.status(200).json({ success: true, message: "Transaction completed and funds settled!" });
                });
            }
        );
    });
});

// ───  DAILY LEDGER REPLENISH ROUTE ───
app.post('/api/admin/replenish-wallet', (req, res) => {
    const { walletId, replenishAmount } = req.body;
    const cobolPath = path.join(__dirname, 'daily_replenish.exe');
    const args = `REPLENISH,${walletId},${replenishAmount}`;

    exec(`"${cobolPath}" "${args}"`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ message: "Replenish Execution Error" });

        const result = stdout.trim().split('|');
        if (result[0] === 'ERROR') return res.status(400).json({ message: result[1] });

        db.query(
            'UPDATE WALLETS SET current_balance = current_balance + ? WHERE wallet_id = ?',
            [replenishAmount, walletId],
            (dbErr, dbRes) => {
                if (dbErr) return res.status(500).json({ message: "Replenish Database Error" });
                res.status(200).json({ success: true, message: `Successfully replenished ${walletId} balance!` });
            }
        );
    });
});

// API Endpoint to check transaction status via COBOL
app.post('/api/transactions/status-check', (req, res) => {
    const { statusCode } = req.body; 
    const cobolExecutable = path.join(__dirname, 'Statuslogic'); 

    execFile(cobolExecutable, [statusCode], (error, stdout, stderr) => {
        if (error) {
            console.error(`COBOL Execution Error: ${error}`);
            return res.status(500).json({ success: false, message: "COBOL Engine Error" });
        }

        const cobolOutput = stdout.trim();
        console.log(`COBOL Engine Output: ${cobolOutput}`);

        if (cobolOutput.includes("APPROVED")) {
            return res.json({ success: true, status: "1", message: "Transaction Approved successfully." });
        } else if (cobolOutput.includes("REJECTED")) {
            return res.json({ success: false, status: "2", message: "Transaction Rejected by Core Ledger." });
        } else {
            return res.json({ success: true, status: "0", message: "Transaction is still Pending in queue." });
        }
    });
});

// ───  ADMIN USER MANAGEMENT ROUTE ───
app.get('/api/admin/users', async (req, res) => {
    const query = `
        SELECT 
            u.id, 
            u.name, 
            u.phone, 
            u.email, 
            u.status, 
            u.isBlacklisted,
            COUNT(t.txn_id) AS totalTxns
        FROM users u
        LEFT JOIN exchange_transactions t ON u.id = t.user_id
        WHERE u.role = 'user' OR u.role IS NULL OR u.role = ''
        GROUP BY u.id
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL Fetch Error:", err);
            return res.status(500).json({ 
                message: 'Database error fetching users', 
                error: err.message 
            });
        }
        
        const formattedResults = results.map(user => ({
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            status: user.status || 'Active',
            isBlacklisted: user.isBlacklisted || 0,
            totalTxns: user.totalTxns || 0 
        }));

        res.status(200).json(formattedResults);
    });
});

// ───  FALLBACK HOOK RECONCILIATION ROUTE (Fixes the 404 Error) ───
app.put('/api/admin/users/:id/status', (req, res) => {
    const userId = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "Missing explicit status variable payload." });
    }

    db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId], (err) => {
        if (err) return res.status(500).json({ message: 'Failed to sync status properties.' });
        res.status(200).json({ message: `User status altered to ${status} successfully.` });
    });
});

// Toggle User Block Status 
app.put('/api/admin/users/:id/toggle-block', (req, res) => {
    const userId = req.params.id;
    
    db.query('SELECT status FROM users WHERE id = ?', [userId], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const currentStatus = results[0].status;
        const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
        
        db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, userId], (err) => {
            if (err) return res.status(500).json({ message: 'Failed to update status' });
            res.status(200).json({ message: `User account has been ${newStatus.toLowerCase()}.` });
        });
    });
});

// Toggle User Blacklist Status 
app.put('/api/admin/users/:id/toggle-blacklist', (req, res) => {
    const userId = req.params.id;
    
    db.query('SELECT isBlacklisted FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error("Blacklist check error:", err);
            return res.status(500).json({ message: 'Database query failure' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const currentBlacklistState = Number(results[0].isBlacklisted || 0);
        const nextBlacklistState = currentBlacklistState === 1 ? 0 : 1;
        
        // 💡 FIXED: Changed 'updateErr' to 'err' to match callback parameters
        db.query('UPDATE users SET isBlacklisted = ? WHERE id = ?', [nextBlacklistState, userId], (err) => {
            if (err) {
                console.error("Blacklist update error:", err);
                return res.status(500).json({ message: 'Failed to update blacklist level' });
            }
            res.status(200).json({ 
                message: nextBlacklistState === 1 ? 'User blacklisted permanently.' : 'Blacklist flag removed.' 
            });
        });
    });
});

//  Route to check a single user's live status during wallet sync
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT id, status, isBlacklisted FROM users WHERE id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database lookup error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(results[0]);
    });
});

//  FIXED: GET USER PROFILE, TRANSACTIONS & COBOL STATS
app.get('/api/user-node/:id', (req, res) => {
    const userId = req.params.id;
    const exePath = path.join(__dirname, 'cobol', 'get_user_txns.exe');

    // Step 1: Fetch User Profile using standard callback
    db.query('SELECT id, name, phone, email, role, profile_photo, created_at, status FROM users WHERE id = ?', [userId], (err, userRows) => {
        if (err) {
            console.error("Database User Query Error:", err);
            return res.status(500).json({ error: "Internal Server Database Controller Error" });
        }
        if (userRows.length === 0) {
            return res.status(404).json({ error: "User Node not found in database." });
        }

        // Step 2: Fetch User's Transactions using standard callback
        const txnQuery = `
            SELECT txn_id, from_wallet, to_wallet, send_amount, receive_amount, 
                   txn_id_tail, sender_name, sender_phone, receiver_name, receiver_phone, 
                   status, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at 
            FROM exchange_transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC`;

        db.query(txnQuery, [userId], (txnErr, txnRows) => {
            if (txnErr) {
                console.error("Database Txn Query Error:", txnErr);
                return res.status(500).json({ error: "Internal Server Database Controller Error" });
            }

            // Step 3: Run COBOL background executable
            exec(`"${exePath}" ${userId}`, (cobolError, stdout, stderr) => {
                let cobolSummary = { totalExchanges: txnRows.length, pendingCount: 0 };

                if (!cobolError && stdout) {
                    const totalMatch = stdout.match(/TOTAL EXCHANGES IN DB\s*:\s*(\d+)/);
                    const pendingMatch = stdout.match(/TOTAL PENDING IN DB\s*:\s*(\d+)/);

                    cobolSummary = {
                        totalExchanges: totalMatch ? parseInt(totalMatch[1], 10) : txnRows.length,
                        pendingCount: pendingMatch ? parseInt(pendingMatch[1], 10) : 0
                    };
                } else {
                    console.error("COBOL Execution Note/Error:", cobolError || stderr);
                }

                // Response package
                res.json({
                    userInfo: userRows[0],
                    userTransactions: txnRows,
                    cobolStats: cobolSummary
                });
            });
        });
    });
});

// FIXED: UPDATE USER PROFILE (Refactored to Standard Callback)
app.put('/api/user-node/update/:id', (req, res) => {
    const userId = req.params.id;
    const { name, phone, email, profile_photo } = req.body;

    if (!name || !phone || !email) {
        return res.status(400).json({ error: "Required fields are missing." });
    }

    const sqlUpdate = `UPDATE users SET name = ?, phone = ?, email = ?, profile_photo = ? WHERE id = ?`;

    db.query(sqlUpdate, [name, phone, email, profile_photo, userId], (err, result) => {
        if (err) {
            console.error("Profile Update Error:", err);
            return res.status(500).json({ error: "Failed to write updates to Database Controller." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User record updates failed or not found." });
        }

        res.json({ 
            success: true, 
            message: "Profile node and database storage updated successfully." 
        });
    });
});

//  FETCH ALL ADMINS (Fixed to use standard 'db' callback) ───
app.get('/api/admins', (req, res) => {
    const query = `
        SELECT id, name, email, phone, role, status, isBlacklisted 
        FROM users 
        WHERE role = 'admin' OR email = 'admin@pay2pay.com' 
        ORDER BY id DESC
    `;

    db.query(query, (err, rows) => {
        if (err) {
            console.error("SQL Fetch Admin Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// ───  CREATE NEW ADMIN (Fixed & Sends back JSON immediately for Live Update) ───
app.post('/api/admins', (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const insertQuery = `
        INSERT INTO users (name, email, phone, password, role, status, isBlacklisted) 
        VALUES (?, ?, ?, ?, 'admin', 'Active', 0)
    `;

    db.query(insertQuery, [name, email, phone, password], (insertErr, result) => {
        if (insertErr) {
            console.error(" SQL Insert Admin Error:", insertErr.message);
            return res.status(500).json({ error: insertErr.message });
        }

        const selectQuery = "SELECT id, name, email, phone, role, status, isBlacklisted FROM users WHERE id = ?";
        db.query(selectQuery, [result.insertId], (selectErr, rows) => {
            if (selectErr) {
                return res.status(500).json({ error: selectErr.message });
            }
            res.status(201).json(rows[0]);
        });
    });
});

// ───  REVOKE ADMIN PROTOCOL (Fixed & Protects Super Admin) ───
app.patch('/api/admins/revoke/:id', (req, res) => {
    const adminId = req.params.id;

    db.query("SELECT email FROM users WHERE id = ?", [adminId], (searchErr, rows) => {
        if (searchErr) return res.status(500).json({ error: searchErr.message });
        if (rows.length === 0) return res.status(404).json({ error: "Admin node not found." });

        if (rows[0].email === 'admin@pay2pay.com') {
            return res.status(403).json({ error: "Action Terminated: Cannot revoke Super Admin Node." });
        }
        const updateQuery = "UPDATE users SET status = 'Revoked', isBlacklisted = 1 WHERE id = ?";
        db.query(updateQuery, [adminId], (updateErr) => {
            if (updateErr) {
                console.error(" SQL Revoke Admin Error:", updateErr.message);
                return res.status(500).json({ error: updateErr.message });
            }
            res.json({ success: true, message: "Operator terminated successfully from server node." });
        });
    });
});

app.listen(5000, () => console.log('Server running on port 5000'));