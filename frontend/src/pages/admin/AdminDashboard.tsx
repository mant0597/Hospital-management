import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Users, Calendar } from 'lucide-react';

// Define the Doctor type
interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  appointments: any[]; 
}

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    // Fetch the list of doctors
    const fetchDoctors = async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/doctors', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors);
      } else {
        alert('Failed to fetch doctors');
      }
    };

    fetchDoctors();
  }, []);

  const deleteDoctor = async (doctorId: string) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:5000/api/admin/doctors/${doctorId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor._id !== doctorId));
      alert('Doctor deleted successfully');
    } else {
      alert('Failed to delete doctor');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appointments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr key={doctor._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {doctor.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doctor.specialty}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Safe check for appointments */}
                  {doctor.appointments?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => deleteDoctor(doctor._id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
