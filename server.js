const express = require('express');
const mysql = require('mysql2')

const app = express();
app.use(express.json());
const port = 5000;

const path = require('path');

var jsonPatientData;

var connection = mysql.createConnection({
    host        : 'localhost', //127.0.0.1
    user        : 'root', 
    password    : 'password', // change this
    database    : 'hosdb'
});

app.listen(port, ()=>{
    console.log(`Server on port http://localhost:${port}`)
    connection.connect((err)=>{
        if (err) throw err;
        console.log("Database connected!")
    })
});

app.get('/patient', async (req, res)=>{
    connection.connect();
    connection.query('SELECT * FROM patient', function(error, results, fields){
        connection.end();
        if (error) throw error;
        var jsonPatientData = res.json(results);
    });
    //res.sendFile(path.join(__dirname, 'patient.html'));
});

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'));
});