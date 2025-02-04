import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch appointments from backend when component mounts
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('doctorToken'); 
        const response = await axios.get('http://localhost:5000/api/doctor/appointments', {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        setAppointments(response.data.appointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      const token = localStorage.getItem('doctorToken');
      const response = await axios.patch(
        `http://localhost:5000/api/doctor/appointments/${id}`,
        { status: 'completed' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setAppointments(appointments.map((appointment) =>
          appointment._id === id ? { ...appointment, status: 'completed' } : appointment
        ));
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Pending Appointments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {appointment.patientName}
                    </h3>
                    <div className="mt-1 flex items-center">
                      <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => handleComplete(appointment._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark as Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
