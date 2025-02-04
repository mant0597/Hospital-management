import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  _id: string;
  doctorId: { name: string, specialty: string } | null;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'cancelled'; 
}

export default function AppointmentHistory() {
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);

  React.useEffect(() => {
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Appointment History</h1>

      {appointments.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No appointments booked yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    {appointment.doctorId ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900">
                          {appointment.doctorId.name}
                        </h3>
                        <p className="text-sm text-gray-500">{appointment.doctorId.specialty}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Doctor information not available</p>
                    )}

                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>
                        {format(new Date(appointment.date), 'MMMM d, yyyy')}
                      </span>
                      <Clock className="flex-shrink-0 mx-1.5 h-5 w-5 text-gray-400" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  <div>
                    {appointment.status === 'completed' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </span>
                    ) : appointment.status === 'cancelled' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <Clock className="h-4 w-4 mr-1" />
                        Cancelled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
