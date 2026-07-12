const express = require('express');
const http = require('http');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const { exec, execFile } = require('child_process');
const path = require('path');
const { spawn } = require('child_process'); 
const { Server } = require('socket.io'); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Frontend URL
        methods: ["GET", "POST", "PUT"]
    }
});

// CORS Middleware Configuration
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true
}));
app.use(cookieParser());
const JWT_SECRET = "10100100";

//  PROFILE PHOTO BASE64 SIZE LIMIT 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static Folder setup (Upload Frontend )
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io Real-time Connection Monitoring
io.on('connection', (socket) => {
    console.log('A user connected via WebSocket:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected from WebSocket');
    });
});

// Connection Pool MySQL Setup 
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'pay2pay_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Database Pool 
db.query('SELECT 1', (err) => {
    if (err) {
        console.error('Database connection pool failed: ' + err.stack);
        return;
    }
    console.log('Connected to XAMPP MySQL Database Pool.');
});

// Upload Folder 
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Base64 QR Image Server Helper Function
const saveBase64Image = (base64String) => {
    if (!base64String || !base64String.startsWith('data:image')) return base64String;

    const matches = base64String.match(/^data:image\/([A-Za-z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');
    const filename = `qr_${Date.now()}.${extension}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filepath, dataBuffer);
    return `http://localhost:5000/uploads/${filename}`;
};

// COBOL Authentication Validator  Helper Function
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

// COBOL Exchange Validator Helper Function
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

// WALLET  Fetch 
app.get('/api/wallets', async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM wallets');
        res.json(rows);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ success: false, message: 'Database fetch failed' });
    }
});

// WALLET create
app.post('/api/wallets/create', async (req, res) => {
    try {
        const { 
            wallet_id, wallet_name, account_number, account_holder, 
            qr_code_path, current_balance, limit_warning, is_active 
        } = req.body;

        if (!wallet_id) {
            return res.status(400).json({ success: false, message: 'Missing wallet_id field' });
        }

        const finalImagePath = saveBase64Image(qr_code_path);

        const sql = `
            INSERT INTO wallets 
            (wallet_id, wallet_name, account_number, account_holder, qr_code_path, current_balance, limit_warning, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.promise().query(sql, [
            wallet_id.toUpperCase(), 
            wallet_name || '', 
            account_number || '', 
            account_holder || '', 
            finalImagePath || null, 
            current_balance || 0, 
            limit_warning || 5000000, 
            is_active || 'Y'
        ]);

        res.json({ success: true, message: 'Wallet created successfully!' });
    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// WALLET Update COBOL Engine API Route
app.post('/api/wallets/update-details', async (req, res) => {
    try {
        const { 
            wallet_id, wallet_name, account_number, account_holder, 
            qr_code_path, current_balance, limit_warning 
        } = req.body;

        let finalImagePath = qr_code_path;
        if (qr_code_path && qr_code_path.startsWith('data:image')) {
            finalImagePath = saveBase64Image(qr_code_path);
        }

        const runCobolEngine = (balance) => {
            return new Promise((resolve) => {
                const cobolCommand = `check_balance.exe ${balance}`;
                exec(cobolCommand, (error, stdout) => {
                    if (!error && stdout) {
                        resolve(stdout.trim().toUpperCase());
                    } else {
                        const state = Number(balance) < 1000 ? 'N' : 'Y';
                        resolve(state);
                    }
                });
            });
        };

        const calculatedActiveState = await runCobolEngine(current_balance);

        const updateSql = `
            UPDATE wallets 
            SET wallet_name = ?, 
                account_number = ?, 
                account_holder = ?, 
                qr_code_path = ?, 
                current_balance = ?, 
                limit_warning = ?, 
                is_active = ? 
            WHERE wallet_id = ?
        `;

        await db.promise().query(updateSql, [
            wallet_name || '', 
            account_number || '', 
            account_holder || '', 
            finalImagePath || null, 
            current_balance || 0, 
            limit_warning || 1000, 
            calculatedActiveState, 
            wallet_id              
        ]);

        res.json({ 
            success: true, 
            is_active: calculatedActiveState, 
            message: 'Wallet config updated and status verified via COBOL engine!' 
        });

    } catch (error) {
        console.error('Update controller error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Fee Rates Fetch
app.get('/api/rates/:id', async (req, res) => {
    let connection;
    try {
        const rateId = req.params.id;
        connection = await db.promise().getConnection();
        
        const [rows] = await connection.query(
            'SELECT id, fee_rate FROM rates WHERE id = ?', 
            [rateId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Rate configuration not found.' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Fetch Rates Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
});

// TRANSACTION check COBOL
app.post('/api/exchange/submit', async (req, res) => {
    console.log("=== Received Request Body ===", req.body);
    
    let connection;
    try {
        const {
            fromWallet,
            toWallet,
            amount,
            txnIdTail,
            senderPhone,
            receiverPhone,
            senderName,
            receiverName,
            userId
        } = req.body;

        if (!fromWallet || !toWallet || !amount || !txnIdTail || !senderPhone || !receiverPhone) {
            return res.status(400).json({ success: false, message: 'Required fields are missing.' });
        }

        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        const [wallets] = await connection.query(
            'SELECT wallet_id, wallet_name, is_active, current_balance FROM wallets WHERE wallet_id IN (?, ?)',
            [fromWallet, toWallet]
        );

        const sourceWallet = wallets.find(w => w.wallet_id === fromWallet);

        if (!sourceWallet) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Source (From) wallet not found in system.' });
        }

        const [rateRows] = await connection.query(
            'SELECT fee_rate FROM rates WHERE id = 1'
        );

        let currentFeeRate = 2; 
        if (rateRows.length > 0) {
            currentFeeRate = parseInt(rateRows[0].fee_rate, 10) || 0; 
        }

        const numericAmount = parseInt(amount, 10);
        const availableBalance = parseInt(sourceWallet.current_balance, 10) || 0;

        console.log(`[Debug Log] Parsed Integer - Amount: ${numericAmount}, Wallet Balance: ${availableBalance}`);

        const cobolArgs = `VALIDATE_TXN,${numericAmount},${availableBalance},${txnIdTail},${senderPhone},${receiverPhone}`;
        
        const runCobolValidator = () => {
            return new Promise((resolve) => {
                exec(`exchangeform.exe "${cobolArgs}"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error("COBOL Runtime Error:", error);
                        resolve({ valid: false, message: "COBOL Validation Engine failed to execute." });
                    } else {
                        const output = stdout.trim();
                        console.log("COBOL Engine Output Log:", output);

                        if (output.startsWith("SUCCESS")) {
                            resolve({ valid: true });
                        } else if (output.startsWith("ERROR|")) {
                            resolve({ valid: false, message: output.split('|')[1] });
                        } else {
                            resolve({ valid: false, message: "System metadata validation failed." });
                        }
                    }
                });
            });
        };

        const cobolResult = await runCobolValidator();
        if (!cobolResult.valid) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: cobolResult.message });
        }

        // ─── FEE Rate ───
        const feePercentage = currentFeeRate / 100;
        const calculatedFee = numericAmount * feePercentage;
        
        // Database Integer Net Amount Math.round 
        const netReceiveAmount = Math.round(numericAmount - calculatedFee);

        await connection.query(
            'UPDATE wallets SET current_balance = current_balance + ? WHERE wallet_id = ?',
            [numericAmount, fromWallet]
        );

        const insertTxnSql = `
            INSERT INTO exchange_transactions 
            (user_id, from_wallet, to_wallet, send_amount, receive_amount, txn_id_tail, sender_name, sender_phone, receiver_name, receiver_phone, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '0')
        `;

        await connection.query(insertTxnSql, [
            userId || 1,
            fromWallet,
            toWallet,
            numericAmount,
            netReceiveAmount, 
            txnIdTail,
            senderName || '',
            senderPhone,
            receiverName || '',
            receiverPhone
        ]);

        await connection.commit();
        
        res.json({ 
            success: true, 
            message: 'Exchange request submitted successfully. Waiting for admin approval (Status: Pending).',
            netReceiveAmount: netReceiveAmount
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Exchange Submit System Failure Log:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error occurred.' });
    } finally {
        if (connection) connection.release();
    }
});

//USER REGISTER 
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

// LOGIN Auth Token 
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

        const userData = {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            status: user.status
        };

        const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: false, 
            maxAge: 60 * 60 * 1000, 
            sameSite: 'lax',
            path: '/'
        });

        return res.status(200).json({
            success: true,
            role: user.role,
            user: userData
        });
    });
});

// AUTHENTICATION Check
app.get('/api/check', (req, res) => {
    const token = req.cookies.auth_token; 

    if (!token) {
        return res.status(200).json({ authenticated: false, role: 'guest', message: "No token found" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.json({ authenticated: true, role: decoded.role, user: decoded });
    } catch (error) {
        return res.status(200).json({ authenticated: false, role: 'guest', message: "Token expired or invalid" });
    }
});

// LOGOUT Cookie 
app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    return res.json({ success: true, message: "Logged out successfully" });
});

// USER PROFILE 
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
/*app.post('/api/tickets/submit', async (req, res) => {
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
});*/
//modified code
// Route to fetch all tickets for the Admin to see
// 1. Route to fetch all tickets (for Admin panel)
app.get('/api/tickets', (req, res) => {
    const sql = 'SELECT * FROM support_tickets ORDER BY id DESC';
    db.execute(sql, (err, rows) => {
        if (err) {
            console.error("Fetch Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Route to update a ticket with Admin Reply
app.patch('/api/tickets/reply/:id', (req, res) => {
    const { adminReply } = req.body;
    const ticketId = req.params.id;

    // Matches the 'admin_reply' column in your database screenshot
    const sql = `UPDATE support_tickets 
                 SET admin_reply = ?, status = 'Resolved' 
                 WHERE id = ?`;

    db.execute(sql, [adminReply, ticketId], (err, result) => {
        if (err) {
            console.error("Update Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: "Reply saved." });
    });
});
// Submit Ticket Route (Using Callbacks)
app.post('/api/tickets/submit', (req, res) => {
    const { userId, fromPay, toPay, txnNo, message } = req.body;
    
    const sql = `INSERT INTO support_tickets (user_id, route, txn_no, user_message, status) 
                 VALUES (?, ?, ?, ?, 'Pending')`;
    
    db.execute(sql, [userId, `${fromPay} ➔ ${toPay}`, txnNo, message], (err, result) => {
        if (err) {
            console.error("Insert Error:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Ticket submitted successfully." });
    });
});

// Fetch Tickets Route (Using Callbacks)
/*
app.get('/api/tickets', (req, res) => {
    db.execute('SELECT * FROM support_tickets ORDER BY id DESC', (err, rows) => {
        if (err) {
            console.error("Fetch Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});*/
// Fetch Tickets Route
//modified code
app.get('/api/tickets', (req, res) => {
    // Replace with your query to filter by user if needed
    const sql = 'SELECT * FROM support_tickets ORDER BY id DESC';
    
    db.execute(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch" });
        }
        res.json(rows);
    });
});

// ───  ADMIN TRANSACTION APPROVAL ROUTE ───
app.post('/api/admin/approve-transaction', async (req, res) => {
    console.log("=== Admin Approving Transaction ===", req.body);
    let connection;
    try {
        const { transactionId, toWallet } = req.body;
        if (!transactionId || !toWallet) {
            return res.status(400).json({ success: false, message: 'Missing parameters.' });
        }

        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        //  FIX: Changed "id = ?" to "txn_id = ?"
        const [txns] = await connection.query(
            'SELECT from_wallet, to_wallet, send_amount, receive_amount, status FROM exchange_transactions WHERE txn_id = ? OR txn_id_tail = ?',
            [transactionId, transactionId]
        );

        if (txns.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Transaction record not found.' });
        }

        const txn = txns[0];
        if (txn.status != '0') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Transaction already processed.' });
        }

        const [wallets] = await connection.query(
            'SELECT current_balance FROM wallets WHERE wallet_id = ?',
            [toWallet]
        );

        if (wallets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Target wallet not found.' });
        }

        const currentTgtBal = parseInt(wallets[0].current_balance, 10) || 0;
        const sendAmountInt = parseInt(txn.send_amount, 10);
        const receiveAmountInt = parseInt(txn.receive_amount, 10);
        const sourceDummyBalance = 0;

        const cobolArgs = `APPROVE,${sendAmountInt}.00,${receiveAmountInt}.00,${sourceDummyBalance}.00,${currentTgtBal}.00`;
        const executablePath = path.join(__dirname, 'settlement.exe');

        let stdout;
        try {
            const result = await execPromise(`"${executablePath}" "${cobolArgs}"`);
            stdout = result.stdout;
        } catch (execError) {
            console.error("COBOL Exec Error:", execError);
            await connection.rollback();
            return res.status(500).json({ success: false, message: "COBOL Engine Process Failed." });
        }

        const output = stdout.trim();
        if (!output.startsWith("SUCCESS")) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: output.split('|')[1] || "Settlement Logic Error." });
        }

        const parts = output.split('|');
        const finalTargetBalance = Math.round(parseFloat(parts[2]));

        await connection.query('UPDATE wallets SET current_balance = ? WHERE wallet_id = ?', [finalTargetBalance, toWallet]);
        
        //  FIX: Changed "id = ?" to "txn_id = ?"
        await connection.query('UPDATE exchange_transactions SET status = "1" WHERE txn_id = ? OR txn_id_tail = ?', [transactionId, transactionId]);

        const profit = sendAmountInt - receiveAmountInt;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        const sqlInsertSettlement = `
            INSERT INTO daily_settlements (settlement_date, total_orders, total_cash_in, total_outflow, profit_generated)
            VALUES (?, 1, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            total_orders = total_orders + 1,
            total_cash_in = total_cash_in + VALUES(total_cash_in),
            total_outflow = total_outflow + VALUES(total_outflow),
            profit_generated = profit_generated + VALUES(profit_generated)
        `;

        await connection.query(sqlInsertSettlement, [today, sendAmountInt, receiveAmountInt, profit]);

        await connection.commit();

        io.emit('transaction_updated', { transactionId, status: '1' });
        return res.json({ success: true, message: 'Transaction approved! Funds successfully settled.' });



    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Approve Error Log:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error.' });
    } finally {
        if (connection) connection.release();
    }
});

// ─── CANCEL / REJECT TRANSACTION ROUTE ───
app.post('/api/admin/cancel-transaction', async (req, res) => {
    console.log("=== Admin Cancelling Transaction ===", req.body);
    let connection;
    try {
        const { transactionId } = req.body;
        if (!transactionId) {
            return res.status(400).json({ success: false, message: 'Missing transactionId.' });
        }

        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // 🌟 FIX: Changed "id = ?" to "txn_id = ?"
        const [txns] = await connection.query(
            'SELECT from_wallet, send_amount, receive_amount, status FROM exchange_transactions WHERE txn_id = ? OR txn_id_tail = ?',
            [transactionId, transactionId]
        );

        if (txns.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Transaction not found.' });
        }

        const txn = txns[0];
        if (txn.status != '0') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Transaction already finalized.' });
        }

        const [wallets] = await connection.query(
            'SELECT current_balance FROM wallets WHERE wallet_id = ?',
            [txn.from_wallet]
        );

        if (wallets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Source wallet reference not found.' });
        }

        const currentSrcBal = parseInt(wallets[0].current_balance, 10) || 0;
        const sendAmountInt = parseInt(txn.send_amount, 10);
        const receiveAmountInt = parseInt(txn.receive_amount, 10);
        const targetDummyBalance = 0;

        const cobolArgs = `CANCEL,${sendAmountInt}.00,${receiveAmountInt}.00,${currentSrcBal}.00,${targetDummyBalance}.00`;
        const executablePath = path.join(__dirname, 'settlement.exe');

        let stdout;
        try {
            const result = await execPromise(`"${executablePath}" "${cobolArgs}"`);
            stdout = result.stdout;
        } catch (execError) {
            console.error("COBOL Cancel Exec Error:", execError);
            await connection.rollback();
            return res.status(500).json({ success: false, message: "COBOL Cancel Process Failed." });
        }

        const output = stdout.trim();
        if (!output.startsWith("SUCCESS")) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: output.split('|')[1] || "Cancel Logic Error." });
        }

        const parts = output.split('|');
        const finalSourceBalance = Math.round(parseFloat(parts[1]));

        await connection.query('UPDATE wallets SET current_balance = ? WHERE wallet_id = ?', [finalSourceBalance, txn.from_wallet]);
        
        // 🌟 FIX: Changed "id = ?" to "txn_id = ?"
        await connection.query('UPDATE exchange_transactions SET status = "2" WHERE txn_id = ? OR txn_id_tail = ?', [transactionId, transactionId]);
        await connection.commit();

        io.emit('transaction_updated', { transactionId, status: '2' });
        return res.json({ success: true, message: 'Transaction cancelled. Ledger state rolled back.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Cancel Error Log:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error.' });
    } finally {
        if (connection) connection.release();
    }
});

//  WALLET Replenish
// app.post('/api/admin/replenish-wallet', (req, res) => {
//     const { walletId, replenishAmount } = req.body;
//     const cobolPath = path.join(__dirname, 'daily_replenish.exe');
//     const args = `REPLENISH,${walletId},${replenishAmount}`;

//     exec(`"${cobolPath}" "${args}"`, (error, stdout, stderr) => {
//         if (error) return res.status(500).json({ message: "Replenish Execution Error" });

//         const result = stdout.trim().split('|');
//         if (result[0] === 'ERROR') return res.status(400).json({ message: result[1] });

//         db.query(
//             'UPDATE wallets SET current_balance = current_balance + ? WHERE wallet_id = ?',
//             [replenishAmount, walletId],
//             (dbErr, dbRes) => {
//                 if (dbErr) return res.status(500).json({ message: "Replenish Database Error" });
//                 res.status(200).json({ success: true, message: `Successfully replenished ${walletId} balance!` });
//             }
//         );
//     });
// });
// ─── GET PENDING TRANSACTIONS ───
app.get('/api/admin/pending-transactions', async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            'SELECT txn_id, user_id, from_wallet, to_wallet, send_amount, receive_amount, txn_id_tail, sender_name, sender_phone, receiver_name, receiver_phone, status, created_at FROM exchange_transactions WHERE status = "0" ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error("Fetch Pending Error:", error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});


// COBOL Transaction Status 
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

// ADMIN PANEL USER Fetch
app.get('/api/admin/users', async (req, res) => {
    // FIX: Swapped COUNT(t.id) to COUNT(t.user_id) because t.id does not exist in exchange_transactions
    const query = `
        SELECT 
            u.id, 
            u.name, 
            u.phone, 
            u.email, 
            u.status, 
            u.isBlacklisted,
            COUNT(t.user_id) AS totalTxns
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

// USER STATUS 
// Note: Keep this route as-is since your React app uses it inside 'handleToggleUserStatus' 
// fetching 'http://localhost:5000/api/admin/users/${userId}/status'
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

// USER Block / Active Toggle
// CLEANUP NOTE: You can safely delete or keep the '/api/admin/users/:id/toggle-block' route.
// Your frontend relies on the explicit JSON payload route above (`/:id/status`), rendering this one redundant.

// USER Blacklist 
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

        db.query('UPDATE users SET isBlacklisted = ? WHERE id = ?', [nextBlacklistState, userId], (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Failed to update blacklist status' });
            
            // FIX: Your React component triggers an alert with data.message. 
            // Changing this to a clean string instead of the raw binary integer makes for a better UI experience.
            const feedbackString = nextBlacklistState === 1 ? "added to the blacklist" : "removed from the blacklist";
            res.status(200).json({ message: `User has been successfully ${feedbackString}.` });
        });
    });
});

// USER Block / Active Toggle
app.put('/api/admin/users/:id/toggle-block', (req, res) => {
    const userId = req.params.id;
    
    // An inline conditional (IF) updates 'Active' to 'Blocked' and vice-versa in 1 step
    const query = `
        UPDATE users 
        SET status = IF(status = 'Active', 'Blocked', 'Active') 
        WHERE id = ?
    `;

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Block status sync failure:", err);
            return res.status(500).json({ message: 'Failed to update user status.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User record not located.' });
        }
        
        res.status(200).json({ message: "User status flipped successfully." });
    });
});

// USER Blacklist Toggle
app.put('/api/admin/users/:id/toggle-blacklist', (req, res) => {
    const userId = req.params.id;
    
    // Flips a 1 to 0 or a 0 to 1 instantly using a XOR operator (isBlacklisted ^ 1)
    // COALESCE ensures it defaults safely to 0 if the field is currently NULL
    const query = `
        UPDATE users 
        SET isBlacklisted = COALESCE(isBlacklisted, 0) ^ 1 
        WHERE id = ?
    `;

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Blacklist toggle failure:", err);
            return res.status(500).json({ message: 'Failed to update blacklist status.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User record not located.' });
        }

        res.status(200).json({ message: "User flag criteria modified." });
    });
});

// Route to check a single user's live status during wallet sync
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

// GET USER PROFILE, TRANSACTIONS & COBOL STATS
app.get('/api/user-node/:id', (req, res) => {
    const userId = req.params.id;
    const exePath = path.join(__dirname, 'get_user_txns.exe');

    // Step 1: Fetch User Profile
    db.query('SELECT id, name, phone, email, role, profile_photo, created_at, status FROM users WHERE id = ?', [userId], (err, userRows) => {
        if (err) {
            console.error("Database User Query Error:", err);
            return res.status(500).json({ error: "Internal Server Database Controller Error" });
        }
        if (userRows.length === 0) {
            return res.status(404).json({ error: "User Node not found in database." });
        }

        // Step 2: Fetch User's Transactions
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

            // Step 3: Run COBOL process using standard I/O pipe configuration
            const cobolProcess = spawn(exePath, [userId], { cwd: __dirname });

            let stdoutData = "";
            let stderrData = "";

            cobolProcess.stdout.on('data', (data) => {
                stdoutData += data.toString();
            });

            cobolProcess.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            txnRows.forEach(row => {
                cobolProcess.stdin.write(`${row.status}\n`);
            });

            cobolProcess.stdin.write("E\n");
            cobolProcess.stdin.end();

            cobolProcess.on('close', (code) => {
                let cobolSummary = { totalExchanges: txnRows.length, pendingCount: 0 };

                if (code === 0 && stdoutData) {
                    const totalMatch = stdoutData.match(/TOTAL EXCHANGES IN DB\s*:\s*(\d+)/);
                    const pendingMatch = stdoutData.match(/TOTAL PENDING IN DB\s*:\s*(\d+)/);

                    cobolSummary = {
                        totalExchanges: totalMatch ? parseInt(totalMatch[1], 10) : txnRows.length,
                        pendingCount: pendingMatch ? parseInt(pendingMatch[1], 10) : 0
                    };
                } else {
                    console.error("COBOL Execution Note/Error:", stderrData || `Exit code: ${code}`);
                }

                res.json({
                    userInfo: userRows[0],
                    userTransactions: txnRows,
                    cobolStats: cobolSummary
                });
            });
        });
    });
});

// UPDATE USER PROFILE (Plain Text Password Storage Version)
app.put('/api/user-node/update/:id', (req, res) => {
    const userId = req.params.id;
    const { name, phone, email, profile_photo, oldPassword, password } = req.body;

    if (!name || !phone || !email) {
        return res.status(400).json({ success: false, error: "Required fields are missing." });
    }

    if (password && password.trim() !== "") {
        const sqlCheckUser = `SELECT password FROM users WHERE id = ?`;
        
        db.query(sqlCheckUser, [userId], (err, results) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ success: false, error: "Database error during validation." });
            }
            if (results.length === 0) {
                return res.status(404).json({ success: false, error: "User not found." });
            }

            const currentDbPassword = results[0].password;

            if (oldPassword !== currentDbPassword) {
                return res.status(400).json({ success: false, error: "Incorrect old password." });
            }

            const sqlUpdateWithPassword = `UPDATE users SET name = ?, phone = ?, email = ?, profile_photo = ?, password = ? WHERE id = ?`;
            
            db.query(sqlUpdateWithPassword, [name, phone, email, profile_photo, password, userId], (updateErr, result) => {
                if (updateErr) {
                    console.error("Profile Update Error:", updateErr);
                    return res.status(500).json({ success: false, error: "Failed to write updates to Database Controller." });
                }
                return res.json({ success: true, message: "Profile and password updated successfully." });
            });
        });

    } else {
        const sqlUpdateWithoutPassword = `UPDATE users SET name = ?, phone = ?, email = ?, profile_photo = ? WHERE id = ?`;
        
        db.query(sqlUpdateWithoutPassword, [name, phone, email, profile_photo, userId], (err, result) => {
            if (err) {
                console.error("Profile Update Error:", err);
                return res.status(500).json({ success: false, error: "Failed to write updates to Database Controller." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, error: "User record updates failed or not found." });
            }
            return res.json({ success: true, message: "Profile updated successfully." });
        });
    }
});
//  FETCH ALL ADMINS
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

// CREATE NEW ADMIN
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

            // Socket.io Broadcast: Broadcast newly designated administrative credentials
            io.emit('admin_created', rows[0]);

            res.status(201).json(rows[0]);
        });
    });
});

// REVOKE ADMIN PROTOCOL
app.patch('/api/admins/revoke/:id', (req, res) => {
    const adminId = req.params.id;
    
    const { status, isBlacklisted } = req.body;

    if (!status || isBlacklisted === undefined) {
        return res.status(400).json({ 
            success: false, 
            error: "Missing required payload: status and isBlacklisted are required." 
        });
    }

    db.query("SELECT email FROM users WHERE id = ?", [adminId], (searchErr, rows) => {
        if (searchErr) {
            console.error("SQL Admin Search Error:", searchErr.message);
            return res.status(500).json({ success: false, error: searchErr.message });
        }
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Admin node not found." });
        }

        if (rows[0].email === 'admin@pay2pay.com') {
            return res.status(403).json({ 
                success: false, 
                error: "Action Terminated: Cannot alter Super Admin Node security state." 
            });
        }

        const updateQuery = "UPDATE users SET status = ?, isBlacklisted = ? WHERE id = ?";
        
        db.query(updateQuery, [status, isBlacklisted, adminId], (updateErr, result) => {
            if (updateErr) {
                console.error("SQL Update Execution Error:", updateErr.message);
                return res.status(500).json({ success: false, error: updateErr.message });
            }

            io.emit('admin_status_changed', { 
                adminId, 
                status, 
                isBlacklisted 
            });

            return res.json({ 
                success: true, 
                message: `Admin node access privileges successfully set to [${status}].` 
            });
        });
    });
});

// UPDATE SYSTEM SETTINGS (FEE & PLATFORM STATUS LOCKDOWN WITH REAL-TIME EMIT)
app.post('/api/settings/update', (req, res) => {
    const { fee_rate, is_platform_online } = req.body;

    // 1. If updating the Processing Fee Rate
    if (fee_rate !== undefined) {
        db.query('UPDATE rates SET fee_rate = ? WHERE id = 1', [fee_rate], (err) => {
            if (err) {
                console.error("SQL Error updating fee:", err);
                return res.status(500).json({ error: "Failed to update rate margin." });
            }

            // Socket.io Broadcast: Inform client engines of core processing fee adjust
            io.emit('fee_rate_updated', { feeRate: parseFloat(fee_rate) });

            return res.json({ success: true });
        });
    } 
    // 2. If handling Emergency Maintenance Lockdowns
    else if (is_platform_online !== undefined) {
        db.query('UPDATE rates SET is_platform_online = ? WHERE id = 1', [is_platform_online], (err) => {
            if (err) {
                console.error("SQL Error updating platform status:", err);
                return res.status(500).json({ error: "Failed to save operational state." });
            }

            if (is_platform_online === 'N') {
                // LOCKDOWN ACTIVATED: Set all user wallet nodes to inactive status
                db.query("UPDATE wallets SET is_active = 'N'", (wErr) => {
                    if (wErr) console.error("Error freezing wallets:", wErr);

                    // Socket.io Broadcast: Trigger full platform blackout matrix to user UI
                    io.emit('platform_status_changed', { isPlatformOnline: false });

                    return res.json({ success: true, status: 'N' });
                });
            } else {
                const balanceQuery = `
                    UPDATE wallets 
                    SET is_active = CASE 
                        WHEN current_balance < 1000 THEN 'N' 
                        ELSE 'Y' 
                    END
                `;
                db.query(balanceQuery, (wErr) => {
                    if (wErr) {
                        console.error("Error restoring conditional wallets:", wErr);
                        return res.status(500).json({ error: "Failed to restore wallets status." });
                    }

                    // Socket.io Broadcast: Inform nodes that gateway operations have normalized
                    io.emit('platform_status_changed', { isPlatformOnline: true });

                    return res.json({ success: true, status: 'Y' });
                });
            }
        });
    } else {
        res.status(400).json({ error: "No operational keys were matched." });
    }
});

// FETCH SYSTEM SETTINGS
app.get('/api/settings', (req, res) => {
    db.query('SELECT * FROM rates WHERE id = 1', (err, results) => {
        if (err) {
            console.error("SQL Fetch Settings Error:", err.message);
            return res.status(500).json({ error: "Failed to fetch system operational gates." });
        }
    
        if (results.length === 0) {
            return res.json({
                feeRate: 2,
                isPlatformOnline: true,
                maintenanceMessage: "System is under maintenance."
            });
        }

        const settings = results[0];    
        res.json({
            feeRate: parseFloat(settings.fee_rate),
            isPlatformOnline: settings.is_platform_online === 'Y',
            maintenanceMessage: settings.maintenance_message
        });
    });
});

app.get('/api/dashboard/diagnostics', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // daily_settlements table 
        const [rows] = await db.promise().query(
            'SELECT * FROM daily_settlements WHERE settlement_date = ?', 
            [today]
        );

        const data = rows[0] || { total_orders: 0, total_cash_in: 0, total_outflow: 0, profit_generated: 0 };

        res.json({
            success: true,
            today: {
                totalOrders: data.total_orders,
                totalIn: data.total_cash_in,
                totalOut: data.total_outflow,
                netProfit: data.profit_generated
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/dashboard/history', async (req, res) => {
    const { start, end } = req.query;
    try {
        const [rows] = await db.promise().query(
            'SELECT * FROM daily_settlements WHERE settlement_date BETWEEN ? AND ? ORDER BY settlement_date DESC',
            [start, end]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/approved-transactions', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const sql = `
            SELECT t.*, u.name AS user_name 
            FROM exchange_transactions t 
            JOIN users u ON t.user_id = u.id 
            WHERE t.status = '1' 
            AND DATE(t.created_at) BETWEEN ? AND ?
            ORDER BY t.created_at DESC
        `;
        
        const [transactionData] = await db.promise().query(sql, [startDate, endDate]);
        
        res.json({ success: true, data: transactionData });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: 'Error fetching data' });
    }
});

// ─── SERVER STARTUP LISTENER ───
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Pay2Pay Backend Engine with Socket.io running on: http://localhost:${PORT}`);
});