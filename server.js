const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors()); // Use the cors middleware
// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});
// Delete a customer
app.delete('/customer/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM customers WHERE customer_id = ?';
  
    db.query(sql, [id], (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.status(200).json({ message: 'Customer deleted successfully' });
    });
  });
app.put('/customer/:id', (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, mobile_number, address, pincode } = req.body;
  
    if (!first_name || !last_name || !email || !mobile_number || !address || !pincode) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
  
    const customer = { first_name, last_name, email, mobile_number, address, pincode };
    const sql = 'UPDATE customers SET ? WHERE customer_id = ?';
    db.query(sql, [customer, id], (err, result) => {
            if (err) throw err;
            if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'Customer not found' });
            }
            res.status(200).json({ message: 'Customer updated successfully', id, ...customer });
          });
        });  
app.get('/customers', (req, res) => {
    let sql = 'SELECT * FROM customers';
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
app.post('/add-customer', (req, res) => {
    const { first_name, last_name,email,mobile_number,address,pincode  } = req.body;

    if (!first_name || !last_name) {
        return res.status(400).send('customer name and last_name, email,mobile_number,address,pincode are required');
    }
    const query = 'INSERT INTO customers (first_name, last_name,email,mobile_number,address,pincode) VALUES (?,?,?,?,?,?)';
    db.query(query, [first_name, last_name,email,mobile_number,address,pincode], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.status(201).send('Customer added successfully!');
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

