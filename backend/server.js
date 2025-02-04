require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/patient-management'; 
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; 

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Patient Schema
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  problem: { type: String, required: true },
  password: { type: String, required: true },
});

const Patient = mongoose.model('Patient', patientSchema);

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  specialty: { type: String, required: true },
  password: { type: String, required: true },
});

const Doctor = mongoose.model('Doctor', doctorSchema);

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'done'], default: 'pending' },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Middleware to authenticate users
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; 
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const adminEmail = "admin@admin.com"; // Hardcoded admin email
const adminPassword = "$2a$10$6CW7YLsxqtn/La4pYGGKb.yvwXZYae.uCby2MIAR6JcqZL1ksXpfq"

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;

  if (email === adminEmail) {
    const isMatch = await bcrypt.compare(password, adminPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  }

  return res.status(400).json({ message: 'Invalid credentials' });
});

app.get('/api/admin/doctors', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
  
    try {
      const doctors = await Doctor.find();
      res.status(200).json({ doctors });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching doctors' });
    }
  });
  
// Register Doctor
app.post('/api/doctor/register', async (req, res) => {
  const { name, email, mobile, specialty, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) return res.status(400).json({ message: 'Doctor already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDoctor = new Doctor({
      name,
      email,
      mobile,
      specialty,
      password: hashedPassword,
    });
    await newDoctor.save();

    const token = jwt.sign({ id: newDoctor._id, role: 'doctor' }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Doctor
app.post('/api/doctor/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: doctor._id, role: 'doctor' }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Delete Doctor
app.delete('/api/admin/doctors/:doctorId', authenticate, async (req, res) => {
    const { doctorId } = req.params;
    
    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      await Appointment.updateMany(
        { doctorId: doctorId, status: 'pending' },
        { $set: { status: 'cancelled' } }
      );
  
      await doctor.deleteOne(); 
  
      res.status(200).json({ message: 'Doctor and pending appointments deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting doctor' });
    }
  });
  
  
  
// Register Patient
app.post('/api/patient/register', async (req, res) => {
  const { name, email, mobile, problem, password } = req.body;

  try {
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) return res.status(400).json({ message: 'Patient already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new Patient({ name, email, mobile, problem, password: hashedPassword });
    await newPatient.save();

    const token = jwt.sign({ id: newPatient._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Appointment History for Patient
app.get('/api/patient/appointment-history', authenticate, async (req, res) => {
  const patientId = req.user.id;  

  try {
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialty')
      .exec();
    res.status(200).json({ appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching appointment history' });
  }
});
// Get Appointments for Doctor
app.get('/api/doctor/appointments', authenticate, async (req, res) => {
    const doctorId = req.user.id; 
  
    try {
      const appointments = await Appointment.find({ doctorId })
        .populate('patientId', 'name problem')
        .exec();
  
      console.log(appointments);
      res.status(200).json({ appointments });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching appointments' });
    }
  });
  
  app.patch('/api/doctor/appointments/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;  
  
    try {
      const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
  
      res.status(200).json({ appointment });
    } catch (error) {
      res.status(500).json({ message: 'Error updating appointment' });
    }
  });
  
  
// Get all Doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json({ doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// Login Patient
app.post('/api/patient/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: patient._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book Appointment
app.post('/api/patient/book-appointment', authenticate, async (req, res) => {
  const { category, doctorId, date, time } = req.body;
  const patientId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(400).json({ message: 'Doctor not found' });
    }

    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    const appointment = new Appointment({
      patientId,
      category: category || 'General',
      doctorId,
      date,
      time,
      status: 'pending',
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully!', appointment });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Appointments for Doctor
app.get('/api/doctor/appointments', authenticate, async (req, res) => {
  const doctorId = req.user.id;

  try {
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name problem')
      .exec();
    res.status(200).json({ appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// Update appointment status (like marking as "done")
app.patch('/api/doctor/appointments/:id', authenticate, async (req, res) => {
  const appointmentId = req.params.id; 
  const { status } = req.body; 

  try {
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json({ appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating appointment' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
