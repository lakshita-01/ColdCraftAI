const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'emails.db'));

// Create schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT,
      recipient TEXT,
      probability REAL,
      status TEXT,
      opened INTEGER,
      replied INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating table:', err);
  });

  // Seeder logic for 1000+ entries
  const seed = () => {
    db.get('SELECT count(*) as count FROM analytics', (err, row) => {
      if (err) {
        console.error('Error counting records:', err);
        return;
      }
      
      if (row.count < 1000) {
        console.log('🌱 Seeding database with 1,200 records...');
        
        const subjects = [
          "Scaling your Engineering Team",
          "Question about [Company] Infrastructure",
          "Frontend Performance optimization tips",
          "New Growth Strategy for 2024",
          "Partnership Inquiry: AI Integration"
        ];

        const companies = ["TechFlow", "Nexus", "CloudScale", "Vertex AI", "DataPulse"];
        
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) console.error('Error starting transaction:', err);
          
          const insertStmt = db.prepare(`
            INSERT INTO analytics (subject, recipient, probability, status, opened, replied, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (let i = 0; i < 1200; i++) {
            const opened = Math.random() > 0.4 ? 1 : 0;
            const replied = opened && Math.random() > 0.7 ? 1 : 0;
            const prob = (0.4 + Math.random() * 0.55).toFixed(2);
            const randomDate = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString();
            
            insertStmt.run(
              `${subjects[i % 5]} - Proposal`,
              `hiring@${companies[i % 5].toLowerCase()}.io`,
              prob,
              replied ? 'Replied' : (opened ? 'Opened' : 'Sent'),
              opened,
              replied,
              randomDate
            );
          }
          
          insertStmt.finalize((err) => {
            if (err) console.error('Error finalizing statement:', err);
            
            db.run('COMMIT', (err) => {
              if (err) console.error('Error committing transaction:', err);
              else console.log('✅ Seeding complete.');
            });
          });
        });
      }
    });
  };

  seed();
});

module.exports = db;
