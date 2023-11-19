const express = require('express');
const mysql = require('mysql2')
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
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
    // this gets the info from the database
    connection.query('SELECT * FROM patient', function(error, results, fields){
        if (error) {
            res.status(500).send('Error fetching patient data');
            return;
        }
        // after getting the db info, it assigns it to patientData then renders the ejs 
        // template views/patient.ejs which is essentially an html with js in it
        res.render('patient', { patientData: results });
        
    });
    
});

// get the form for edit patient
app.get('/edit-patient/:patientId', (req, res) => {
    const { patientId } = req.params;

    // Fetch patient data based on the patientId
    connection.query('SELECT * FROM Patient WHERE PatientId = ?', [patientId], (error, results) => {
        if (error) {
            console.error('Error fetching patient data:', error);
            res.status(500).send('Error fetching patient data');
        } else {
            // Render the editPatient.ejs page with the patient data
            res.render('editPatient', { patientData: results[0] });
        }
    });
});

// edit patient insurance id so far
app.post('/edit/patient', (req,res)=>{
    const {patientId, newInsId} = req.body;
    console.log(req.body);

    connection.query('UPDATE Patient SET InsuranceID=? WHERE PatientId=?',
    [newInsId, patientId],
    (error, results) =>{
        if (error){
            console.error('Error updating the patient data:', error);
            res.status(500).send('Error updating patient data');
        } else {
            res.redirect('/');
        }
    }
    )
})

app.get('/patient_ins_hist', async (req, res)=>{
    // this gets the info from the database
    connection.query('SELECT * FROM patientinsurancehistory', function(error, results, fields){
        if (error) {
            res.status(500).send('Error fetching patient data');
            return;
        }
        res.render('patient_ins_history', { patientInsuranceHistory: results });
        
    });
    
});

// I just had this here to reference the data structure of the db 
app.get('/api/data/patient', async (req, res)=>{
    
    connection.query('SELECT * FROM patient', function(error, results, fields){
        
        if (error) throw error;
        var jsonPatientData = res.json(results);
    });
    
});

// Patient Diagnosis Visit table
app.get('/patientVisit', async (req, res)=>{
    // this gets the info from the database
    connection.query('SELECT * FROM PatientDiagnosisView', function(error, results, fields){
        if (error) {
            res.status(500).send('Error fetching patient visit diagnosis view');
            return;
        }
       
        res.render('patientVisit', { patientVisit: results });
        
    });
    
});

// this is not done yet
app.get('/', async(req, res)=>{
    const patientQuery = new Promise((resolve, reject)=>{
        connection.query('SELECT * FROM patient', function(error, results, fields){
                if(error){
                    reject(error);
                    return;
                }
                resolve(results);
            });
    });

    const diagnosisViewQuery = new Promise((resolve, reject)=>{
        connection.query('SELECT * FROM PatientDiagnosisView',(error, results)=>{
            if(error){
                reject(error);
                return;
            }
            resolve(results);
        });
    });
    
    const [patientData, patientVisit] =  await Promise.all([patientQuery, diagnosisViewQuery]);

    res.render('index', {
        patientData: patientData,
        patientVisit: patientVisit
    });
});