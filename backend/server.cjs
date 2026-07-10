const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const { exec, execFile } = require('child_process');
const path = require('path');
const { spawn } = require('child_process'); 

const app = express();
app.use(cors());

// PROFILE PHOTO BASE64 SIZE LIMIT 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ FIXED: Configured as a Connection Pool to support .getConnection()
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'pay2pay_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the pool initialized correctly
db.query('SELECT 1', (err) => {
    if (err) {
        console.error('Database connection pool failed: ' + err.stack);
        return;
    }
    console.log('Connected to XAMPP MySQL Database Pool.');
});

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
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

//  Helper function to call COBOL Authentication Validator
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

//  Helper Function to call COBOL Exchange Validator (Comma Separated Delimiter)
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
app.get('/api/wallets', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM wallets');
    res.json(rows);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ success: false, message: 'Database fetch failed' });
  }
});

// CREATE WALLET API
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

// UPDATE WALLET DETAILS & CALL COBOL ENGINE API
app.post('/api/wallets/update-details', async (req, res) => {
  try {
    const { 
      wallet_id, wallet_name, account_number, account_holder, 
      qr_code_path, current_balance, limit_warning, is_active, isToggleAction
    } = req.body;


    let finalImagePath = qr_code_path;
    if (qr_code_path && qr_code_path.startsWith('data:image')) {
      finalImagePath = saveBase64Image(qr_code_path);
    }

    const runCobolEngine = (balance) => {
      return new Promise((resolve) => {
        if (isToggleAction && is_active) {
          return resolve(is_active);
        }
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

    res.json(rows[0]); // Returns { id: 1, fee_rate: 2.0 }
  } catch (error) {
    console.error('Fetch Rates Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
});

// SUBMIT TRANSACTION ROUTE
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

    // 1. Initial Frontend Inputs Validation
    if (!fromWallet || !toWallet || !amount || !txnIdTail || !senderPhone || !receiverPhone) {
      return res.status(400).json({ success: false, message: 'Required fields are missing.' });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // 2. Fetch Wallet status dynamically from Database
    const [wallets] = await connection.query(
      'SELECT wallet_id, wallet_name, is_active, current_balance FROM wallets WHERE wallet_id IN (?, ?)',
      [fromWallet, toWallet]
    );

    const sourceWallet = wallets.find(w => w.wallet_id === fromWallet);

    if (!sourceWallet) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Source (From) wallet not found in system.' });
    }

    // 3. Fetch current fee rate (Handle as Integer)
    const [rateRows] = await connection.query(
      'SELECT fee_rate FROM rates WHERE id = 1'
    );

    let currentFeeRate = 2; 
    if (rateRows.length > 0) {
      currentFeeRate = parseInt(rateRows[0].fee_rate, 10) || 0; 
    }

    // 4. Prepare Arguments and execute COBOL Validation Engine
    const availableBalance = sourceWallet.current_balance; 
    const cobolArgs = `VALIDATE_TXN,${amount},${availableBalance},${txnIdTail},${senderPhone},${receiverPhone}`;
    
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

    // 5. Accurate Amount Calculations (Integer Fee Friendly)
    const numericAmount = Number(amount);
    const feePercentage = currentFeeRate / 100;
    const calculatedFee = numericAmount * feePercentage;
    const netReceiveAmount = parseFloat((numericAmount - calculatedFee).toFixed(2));
    // 6. Deduct Balance from Source Wallet
    await connection.query(
      'UPDATE wallets SET current_balance = current_balance - ? WHERE wallet_id = ?',
      [numericAmount, fromWallet]
    );

    // 7. Log Transaction Record under Status '0' (Pending)
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
            'UPDATE wallets SET current_balance = current_balance - ? WHERE wallet_id = ?',
            [amount, toWallet],
            (dbErr, dbRes) => {
                if (dbErr) return res.status(500).json({ message: "Database Update Failed" });
                
                db.query('UPDATE exchange_transactions SET status = "1" WHERE txn_id = ?', [transactionId], (statusErr) => {
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
            'UPDATE wallets SET current_balance = current_balance + ? WHERE wallet_id = ?',
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

//  GET USER PROFILE, TRANSACTIONS & COBOL STATS
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

            // ─── STEP 3: RUN COBOL VIA STANDARD INPUT/OUTPUT PIPE
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

// UPDATE USER PROFILE (Refactored to Standard Callback)
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

//  CREATE NEW ADMIN
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

//  REVOKE ADMIN PROTOCOL
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

app.post('/api/settings/update', (req, res) => {
    const { fee_rate, is_platform_online } = req.body;

    // 1. If updating the Processing Fee Rate
    if (fee_rate !== undefined) {
        db.query('UPDATE rates SET fee_rate = ? WHERE id = 1', [fee_rate], (err) => {
            if (err) {
                console.error("SQL Error updating fee:", err);
                return res.status(500).json({ error: "Failed to update rate margin." });
            }
            return res.json({ success: true });
        });
    } 
    // 2. If handling Emergency Maintenance Lockdowns
    else if (is_platform_online !== undefined) {
        // Step A: Save the new operational gate layout status to rates table
        db.query('UPDATE rates SET is_platform_online = ? WHERE id = 1', [is_platform_online], (err) => {
            if (err) {
                console.error("SQL Error updating platform status:", err);
                return res.status(500).json({ error: "Failed to save operational state." });
            }

            if (is_platform_online === 'N') {
                // LOCKDOWN ACTIVATED: Set all user wallet nodes to inactive status
                db.query("UPDATE wallets SET is_active = 'N'", (wErr) => {
                    if (wErr) console.error("Error freezing wallets:", wErr);
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
                    return res.json({ success: true, status: 'Y' });
                });
            }
        });
    } else {
        res.status(400).json({ error: "No operational keys were matched." });
    }
});

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

app.listen(5000, () => console.log('Server running on port 5000'));