import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("rental.db");

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    type TEXT NOT NULL,
    rent_amount REAL NOT NULL,
    status TEXT DEFAULT 'Available'
  );

  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    property_id INTEGER,
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS leases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    tenant_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    monthly_rent REAL NOT NULL,
    status TEXT DEFAULT 'Active',
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lease_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    status TEXT DEFAULT 'Paid',
    FOREIGN KEY (lease_id) REFERENCES leases(id)
  );

  CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Open',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );
`);

// Seed data if empty
const propertyCount = db.prepare("SELECT COUNT(*) as count FROM properties").get() as { count: number };
if (propertyCount.count === 0) {
  db.prepare("INSERT INTO properties (name, address, type, rent_amount, status) VALUES (?, ?, ?, ?, ?)").run(
    "Sunset Apartments - Unit 101", "123 Solar Way, Phoenix, AZ", "Apartment", 1200, "Occupied"
  );
  db.prepare("INSERT INTO properties (name, address, type, rent_amount, status) VALUES (?, ?, ?, ?, ?)").run(
    "Sunset Apartments - Unit 102", "123 Solar Way, Phoenix, AZ", "Apartment", 1250, "Available"
  );
  db.prepare("INSERT INTO properties (name, address, type, rent_amount, status) VALUES (?, ?, ?, ?, ?)").run(
    "Oak Ridge House", "456 Forest Dr, Portland, OR", "Single Family", 2500, "Occupied"
  );

  db.prepare("INSERT INTO tenants (first_name, last_name, email, phone, property_id) VALUES (?, ?, ?, ?, ?)").run(
    "John", "Doe", "john@example.com", "555-0101", 1
  );
  db.prepare("INSERT INTO tenants (first_name, last_name, email, phone, property_id) VALUES (?, ?, ?, ?, ?)").run(
    "Jane", "Smith", "jane@example.com", "555-0202", 3
  );

  db.prepare("INSERT INTO leases (property_id, tenant_id, start_date, end_date, monthly_rent) VALUES (?, ?, ?, ?, ?)").run(
    1, 1, "2024-01-01", "2024-12-31", 1200
  );
  db.prepare("INSERT INTO leases (property_id, tenant_id, start_date, end_date, monthly_rent) VALUES (?, ?, ?, ?, ?)").run(
    3, 2, "2024-02-01", "2025-01-31", 2500
  );

  db.prepare("INSERT INTO payments (lease_id, amount, payment_date) VALUES (?, ?, ?)").run(1, 1200, "2024-02-01");
  db.prepare("INSERT INTO payments (lease_id, amount, payment_date) VALUES (?, ?, ?)").run(3, 2500, "2024-02-05");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/stats", (req, res) => {
    const totalProperties = db.prepare("SELECT COUNT(*) as count FROM properties").get() as any;
    const occupiedProperties = db.prepare("SELECT COUNT(*) as count FROM properties WHERE status = 'Occupied'").get() as any;
    const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM payments").get() as any;
    const openMaintenance = db.prepare("SELECT COUNT(*) as count FROM maintenance WHERE status = 'Open'").get() as any;

    res.json({
      totalProperties: totalProperties.count,
      occupancyRate: Math.round((occupiedProperties.count / totalProperties.count) * 100) || 0,
      totalRevenue: totalRevenue.total || 0,
      openMaintenance: openMaintenance.count
    });
  });

  app.get("/api/properties", (req, res) => {
    const properties = db.prepare("SELECT * FROM properties").all();
    res.json(properties);
  });

  app.post("/api/properties", (req, res) => {
    const { name, address, type, rent_amount } = req.body;
    const result = db.prepare("INSERT INTO properties (name, address, type, rent_amount) VALUES (?, ?, ?, ?)").run(name, address, type, rent_amount);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/tenants", (req, res) => {
    const tenants = db.prepare(`
      SELECT t.*, p.name as property_name 
      FROM tenants t 
      LEFT JOIN properties p ON t.property_id = p.id
    `).all();
    res.json(tenants);
  });

  app.get("/api/payments", (req, res) => {
    const payments = db.prepare(`
      SELECT p.*, t.first_name, t.last_name, prop.name as property_name
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      JOIN tenants t ON l.tenant_id = t.id
      JOIN properties prop ON l.property_id = prop.id
      ORDER BY p.payment_date DESC
    `).all();
    res.json(payments);
  });

  app.get("/api/maintenance", (req, res) => {
    const issues = db.prepare(`
      SELECT m.*, p.name as property_name 
      FROM maintenance m
      JOIN properties p ON m.property_id = p.id
      ORDER BY m.created_at DESC
    `).all();
    res.json(issues);
  });

  app.post("/api/maintenance", (req, res) => {
    const { property_id, description, priority } = req.body;
    const result = db.prepare("INSERT INTO maintenance (property_id, description, priority) VALUES (?, ?, ?)").run(property_id, description, priority);
    res.json({ id: result.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
