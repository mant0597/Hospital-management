import React from 'react';
import { Link } from 'react-router-dom';
import { UserRound, Stethoscope, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Welcome to HealthCare Hub
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/admin/login"
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <ShieldCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Admin Portal
              </h2>
              <p className="text-gray-600">
                Manage doctors and monitor appointments
              </p>
            </Link>
            
            <Link
              to="/doctor/login"
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <Stethoscope className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Doctor Portal
              </h2>
              <p className="text-gray-600">
                View and manage patient appointments
              </p>
            </Link>
            
            <Link
              to="/patient/login"
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <UserRound className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Patient Portal
              </h2>
              <p className="text-gray-600">
                Book appointments and track your health
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}