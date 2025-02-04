import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ClipboardList } from 'lucide-react';

interface Appointment {
  _id: string;
  category: string;
  date: string; 
  status: string;
}

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
  
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/patient/appointment-history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, 
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments || []);
        } else {
          console.error('Failed to fetch appointment history');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
        <div className="space-x-4">
          <Link
            to="/patient/book-appointment"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Book Appointment
          </Link>
          <Link
            to="/patient/appointment-history"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ClipboardList className="h-5 w-5 mr-2" />
            Appointment History
          </Link>
        </div>
      </div>

      {/* Display Appointment History */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <p className="text-lg text-gray-500">You have no appointments yet.</p>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="p-4 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-medium text-gray-900">{appointment.category}</h3>
              <p className="text-sm text-gray-500">
                Date: {new Date(appointment.date).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Status: {appointment.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
