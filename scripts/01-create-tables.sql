-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE appointment_type AS ENUM ('telemedicine', 'home_visit');
CREATE TYPE doctor_status AS ENUM ('pending', 'approved', 'rejected');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  specialties TEXT[] NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  years_of_experience INTEGER,
  education TEXT,
  certifications TEXT,
  bio TEXT,
  consultation_fee DECIMAL(10,2),
  status doctor_status DEFAULT 'pending',
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_type appointment_type NOT NULL,
  status appointment_status DEFAULT 'pending',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  symptoms TEXT,
  notes TEXT,
  prescription TEXT,
  daily_room_url TEXT, -- For telemedicine appointments
  address TEXT, -- For home visits
  total_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create home_visit_services table
CREATE TABLE public.home_visit_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  service_category TEXT NOT NULL,
  service_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_visit_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for patients
CREATE POLICY "Patients can view their own data" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Patients can update their own data" ON public.patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Patients can insert their own data" ON public.patients FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for doctors
CREATE POLICY "Doctors can view their own data" ON public.doctors FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Doctors can update their own data" ON public.doctors FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors can insert their own data" ON public.doctors FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Anyone can view approved doctors" ON public.doctors FOR SELECT USING (status = 'approved');

-- RLS Policies for appointments
CREATE POLICY "Patients can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update their own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can update their own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = doctor_id);

-- RLS Policies for home_visit_services
CREATE POLICY "Users can view services for their appointments" ON public.home_visit_services 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE appointments.id = home_visit_services.appointment_id 
      AND (appointments.patient_id = auth.uid() OR appointments.doctor_id = auth.uid())
    )
  );

CREATE POLICY "Patients can insert services for their appointments" ON public.home_visit_services 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE appointments.id = home_visit_services.appointment_id 
      AND appointments.patient_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_date ON public.appointments(scheduled_date);
CREATE INDEX idx_doctors_specialties ON public.doctors USING GIN(specialties);
CREATE INDEX idx_doctors_status ON public.doctors(status);
