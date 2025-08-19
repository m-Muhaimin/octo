import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CSV file and convert to patient data with new schema
function convertCsvToPatientData() {
  const csvPath = path.join(__dirname, 'attached_assets', 'patients_1755620198932.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  
  const patients = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
    const patient = {};
    
    headers.forEach((header, index) => {
      patient[header] = values[index] || null;
    });
    
    // Convert to new schema format
    const newPatient = {
      patientId: `#${patient.first_name.toUpperCase()}${patient.last_name.toUpperCase().slice(0,2)}${patient.patient_id}`,
      firstName: patient.first_name,
      lastName: patient.last_name,
      gender: patient.gender === 'M' ? 'Male' : 'Female',
      dateOfBirth: patient.date_of_birth,
      race: patient.race,
      ethnicity: patient.ethnicity,
      address: patient.address,
      city: patient.city,
      state: patient.state,
      zipCode: patient.zip_code,
      phoneNumber: patient.phone,
      email: patient.email,
      primaryLanguage: patient.primary_language,
      maritalStatus: patient.marital_status,
      insuranceType: patient.insurance_type,
      lastVisitDate: patient.last_visit_date,
      department: 'General Medicine',
      avatar: `${patient.first_name[0]}${patient.last_name[0]}`.toUpperCase()
    };
    
    patients.push(newPatient);
  }
  
  return patients;
}

console.log('Converting CSV data...');
const patientData = convertCsvToPatientData();
console.log(`Converted ${patientData.length} patients from CSV`);
console.log('Sample patient:', JSON.stringify(patientData[0], null, 2));

// Write to a temp file that can be imported
fs.writeFileSync('patient_import_data.json', JSON.stringify(patientData, null, 2));
console.log('Patient data written to patient_import_data.json');