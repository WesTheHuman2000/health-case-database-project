const express = require('express');
const mysql = require('mysql2')
const path = require('path');

const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const port = 5000;

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
    connection.query('SELECT * FROM patient', function(error, results, fields){
        if (error) {
            res.status(500).send('Error fetching patient data');
            return;
        }
        res.render('patient', { patientData: results }); // Render the EJS template with data
        
    });
    //res.sendFile(path.join(__dirname, 'patient.html'));
});

app.get('/api/data/patient', async (req, res)=>{
    
    connection.query('SELECT * FROM patient', function(error, results, fields){
        
        if (error) throw error;
        var jsonPatientData = res.json(results);
    });
    //res.sendFile(path.join(__dirname, 'patient.html'));
});


app.get('/', (req, res)=>{
    res.render('index');
});