const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const nodemailer = require('nodemailer');

// Initialize SMTP settings table
const smtpTableInit = `
  CREATE TABLE IF NOT EXISTS smtp_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host TEXT,
    port INTEGER,
    secure INTEGER,
    user TEXT,
    pass TEXT,
    fromAddress TEXT
  )
`;
db.run(smtpTableInit, (err) => {
  if (err) console.error('Failed to init smtp_settings', err);
});

// Save or update SMTP settings
app.post('/api/smtp', (req, res) => {
  const { host, port, secure, user, pass, fromAddress } = req.body;
  // replace existing settings
  db.run('DELETE FROM smtp_settings', (e) => {
    db.run(
      `INSERT INTO smtp_settings (host, port, secure, user, pass, fromAddress) VALUES (?, ?, ?, ?, ?, ?)`,
      [host, port, secure ? 1 : 0, user, pass, fromAddress],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ ok: true });
      }
    );
  });
});

app.get('/api/smtp', (req, res) => {
  db.get('SELECT * FROM smtp_settings ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || null);
  });
});

app.post('/api/smtp/test', async (req, res) => {
  const { host, port, secure, user, pass, fromAddress, to } = req.body;
  try {
    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
    await transporter.verify();
    if (to) {
      await transporter.sendMail({ from: fromAddress || user, to, subject: 'Test email', text: 'This is a test.' });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes
app.get('/api/analytics', (req, res) => {
  db.all('SELECT * FROM analytics ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/stats', (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total,
      AVG(probability) as avgProb,
      SUM(opened) as totalOpened,
      SUM(replied) as totalReplied
    FROM analytics
  `, (err, stats) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(stats);
    }
  });
});

app.post('/api/emails', (req, res) => {
  const { subject, recipient, probability } = req.body;
  const insert = `
    INSERT INTO analytics (subject, recipient, probability, status, opened, replied)
    VALUES (?, ?, ?, 'Sent', 0, 0)
  `;
  db.run(insert, [subject, recipient, probability], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // After saving, attempt to send via configured SMTP if available
      const lastID = this.lastID;
      db.get('SELECT * FROM smtp_settings ORDER BY id DESC LIMIT 1', (err2, settings) => {
        if (!err2 && settings) {
          (async () => {
            try {
              const transporter = nodemailer.createTransport({
                host: settings.host,
                port: settings.port,
                secure: !!settings.secure,
                auth: { user: settings.user, pass: settings.pass }
              });
              // send a simple text email; frontend can include 'preview' in body for full text
              await transporter.sendMail({ from: settings.fromAddress || settings.user, to: recipient, subject, text: req.body.preview || '' });
            } catch (e) {
              console.error('SMTP send failed', e.message);
            }
          })();
        }
        res.json({ id: lastID });
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
