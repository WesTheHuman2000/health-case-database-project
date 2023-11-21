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
// edit address, zip, city
app.post('/edit/patient', (req,res)=>{
    const {patientId, newInsId, newAddress, newZip, newCity} = req.body;
    console.log(req.body);

    connection.query('UPDATE Patient SET InsuranceID=?, Address1=?, ZipCode =?, City=?  WHERE PatientId=?',
    [newInsId, newAddress, newZip, newCity, patientId,],
    (error, results) =>{
        if (error){
            console.error('Error updating the patient data:', error);
            res.status(500).send('Error updating patient data');
        } else {
            res.redirect('/');
        }
    }
    )
});

// create patient form
app.get('/createPatient', async (req, res)=>{
    // strictly for rendering the form
     res.render('createPatient');
});


app.post('/createPatient', (req, res) => {
    const {
        Firstname,
        Lastname,
        Dob,
        InsuranceID,
        Ins_ID,
        Emailaddress,
        Address1,
        City,
        State,
        ZipCode
    } = req.body;
    console.log(req.body);
    // Perform the database insertion
    connection.query('INSERT INTO Patient (Firstname, Lastname, Dob, InsuranceID, Ins_ID, Emailaddress, Address1, City, State, ZipCode, CreatedBy, CreatedDate, ModifiedBy, ModifiedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())',
        [Firstname, Lastname, Dob, InsuranceID, Ins_ID, Emailaddress, Address1, City, State, ZipCode, 1, 1],
        (error, results) => {
            if (error) {
                console.error('Error inserting new patient:', error);
                res.status(500).send('Error inserting new patient');
            } else {
                // Redirect to the patient list page or any other page as needed
                console.log('Received form data:', req.body);
                res.redirect('/patient');
            }
        }
    );
});

// stored procedure for inserting dummy patient
app.get('/createDummyPatient', (req, res)=>{
    connection.query('CALL InsertDummyPatient()', (error,results,fields)=>{
        if(error){
            console.log('Error adding dummy patient through stored procedure', error);
        } else{
            console.log('added dummy patient')
            res.redirect('/patient');
        }
    });
});



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

// gets patient updateAddresses view
app.get('/patientUpdated', async (req, res)=>{
    // this gets the info from the database
    connection.query('SELECT * FROM patientUpdatedAddresses', function(error, results, fields){
        if (error) {
            res.status(500).send('Error fetching patient updated addresses view');
            return;
        }
        
        res.render('patientUpdated', { patientUpdated: results });
        
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

// delete patient
app.get('/deletePatient/:patientId', (req, res) => {
    const { patientId } = req.params;

    // Fetch patient data based on the patientId
    connection.query('SELECT * FROM Patient WHERE PatientId = ?', [patientId], (error, results) => {
        if (error) {
            console.error('Error fetching patient data:', error);
            res.status(500).send('Error fetching patient data');
        } else {
            // Render the editPatient.ejs page with the patient data
            res.render('deletePatient', { patientData: results[0] });
        }
    });
});

app.post('/deletePatient/:patientId', (req,res)=>{
    const {patientId} = req.params;
    

    connection.query('DELETE FROM Patient WHERE PatientId = ?',
    [ patientId,],
    (error, results) =>{
        if (error){
            console.error('Error deleting the patient data:', error);
            res.status(500).send('Error updating patient data');
        } else {
            res.redirect('/patient');
        }
    }
    )
})

// done
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

// work on completing the write to patients table function
// work on the login functionality
// work on the delete from table functionality