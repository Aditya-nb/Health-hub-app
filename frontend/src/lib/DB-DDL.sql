-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  date date NOT NULL,
  time time without time zone NOT NULL,
  type text NOT NULL,
  status text NOT NULL CHECK (
    status = ANY (
      ARRAY ['Scheduled'::text, 'Completed'::text, 'Cancelled'::text, 'Upcoming'::text, 'In Progress'::text]
    )
  ),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id)
);
CREATE TABLE public.bill_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bill_id uuid NOT NULL,
  description text NOT NULL,
  quantity integer NOT NULL,
  rate numeric NOT NULL,
  amount numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT bill_items_pkey PRIMARY KEY (id),
  CONSTRAINT bill_items_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id)
);
CREATE TABLE public.bills (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  doctor_id uuid,
  appointment_id uuid,
  date date NOT NULL,
  subtotal numeric NOT NULL,
  discount numeric NOT NULL,
  total numeric NOT NULL,
  status text NOT NULL CHECK (
    status = ANY (
      ARRAY ['Paid'::text, 'Pending'::text, 'Overdue'::text]
    )
  ),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT bills_pkey PRIMARY KEY (id),
  CONSTRAINT bills_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT bills_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id),
  CONSTRAINT bills_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.doctor_visits (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ipd_patient_id uuid NOT NULL,
  doctor_id uuid,
  time time without time zone NOT NULL,
  visit_type text NOT NULL,
  notes text,
  vitals_status text CHECK (
    vitals_status = ANY (
      ARRAY ['Stable'::text, 'Improving'::text, 'Critical'::text, 'Declining'::text]
    )
  ),
  prescription text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT doctor_visits_pkey PRIMARY KEY (id),
  CONSTRAINT doctor_visits_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id),
  CONSTRAINT doctor_visits_ipd_patient_id_fkey FOREIGN KEY (ipd_patient_id) REFERENCES public.ipd_patients(id)
);
CREATE TABLE public.doctors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  specialization text NOT NULL,
  contact text,
  email text UNIQUE,
  experience integer,
  availability ARRAY,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT doctors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ipd_patients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  room_number text NOT NULL,
  bed_number text NOT NULL,
  admission_date date NOT NULL,
  condition text NOT NULL,
  severity text NOT NULL CHECK (
    severity = ANY (
      ARRAY ['Critical'::text, 'Stable'::text, 'Recovering'::text]
    )
  ),
  assigned_doctor_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT ipd_patients_pkey PRIMARY KEY (id),
  CONSTRAINT ipd_patients_assigned_doctor_id_fkey FOREIGN KEY (assigned_doctor_id) REFERENCES public.doctors(id),
  CONSTRAINT ipd_patients_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.iv_schedule (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ipd_patient_id uuid NOT NULL,
  time time without time zone NOT NULL,
  fluid text NOT NULL,
  volume text NOT NULL,
  rate text NOT NULL,
  status text NOT NULL CHECK (
    status = ANY (
      ARRAY ['Running'::text, 'Completed'::text, 'Scheduled'::text, 'Stopped'::text]
    )
  ),
  nurse text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT iv_schedule_pkey PRIMARY KEY (id),
  CONSTRAINT iv_schedule_ipd_patient_id_fkey FOREIGN KEY (ipd_patient_id) REFERENCES public.ipd_patients(id)
);
CREATE TABLE public.medical_records (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  doctor_id uuid,
  date date NOT NULL,
  condition text NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT medical_records_pkey PRIMARY KEY (id),
  CONSTRAINT medical_records_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id),
  CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.medicine_schedule (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ipd_patient_id uuid NOT NULL,
  time time without time zone NOT NULL,
  medicine text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  status text NOT NULL CHECK (
    status = ANY (
      ARRAY ['Given'::text, 'Pending'::text, 'Scheduled'::text, 'Missed'::text]
    )
  ),
  nurse text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT medicine_schedule_pkey PRIMARY KEY (id),
  CONSTRAINT medicine_schedule_ipd_patient_id_fkey FOREIGN KEY (ipd_patient_id) REFERENCES public.ipd_patients(id)
);
CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  contact text,
  email text,
  abha_id text UNIQUE,
  address text,
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT patients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.prescriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  doctor_id uuid,
  date date NOT NULL,
  medication text NOT NULL,
  dosage text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
  CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id),
  CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
-- we use supabase auth for users
CREATE TABLE public.vitals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ipd_patient_id uuid NOT NULL,
  time time without time zone NOT NULL,
  heart_rate integer NOT NULL,
  temperature numeric NOT NULL,
  blood_pressure text NOT NULL,
  oxygen_saturation integer NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT vitals_pkey PRIMARY KEY (id),
  CONSTRAINT vitals_ipd_patient_id_fkey FOREIGN KEY (ipd_patient_id) REFERENCES public.ipd_patients(id)
);