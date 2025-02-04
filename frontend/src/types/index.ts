export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  problem: string;
  password: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  mobile: string;
  specialty: string;
  password: string;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  date: string;
  time: string;
  problem: string;
  status: 'pending' | 'completed';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}