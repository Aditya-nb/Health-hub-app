export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: "admin" | "doctor";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: "admin" | "doctor";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: "admin" | "doctor";
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "admin" | "doctor" | "nurse" | "staff";
          phone: string | null;
          department: string | null;
          doctor_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "admin" | "doctor" | "nurse" | "staff";
          phone?: string | null;
          department?: string | null;
          doctor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "admin" | "doctor" | "nurse" | "staff";
          phone?: string | null;
          department?: string | null;
          doctor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          name: string;
          age: number;
          gender: string;
          contact: string | null;
          email: string | null;
          abha_id: string | null;
          address: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          age: number;
          gender: string;
          contact?: string | null;
          email?: string | null;
          abha_id?: string | null;
          address?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          age?: number;
          gender?: string;
          contact?: string | null;
          email?: string | null;
          abha_id?: string | null;
          address?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          name: string;
          specialization: string;
          contact: string | null;
          email: string | null;
          experience: number | null;
          availability: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          specialization: string;
          contact?: string | null;
          email?: string | null;
          experience?: number | null;
          availability?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          specialization?: string;
          contact?: string | null;
          email?: string | null;
          experience?: number | null;
          availability?: string[] | null;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          time: string;
          type: string;
          status:
            | "Scheduled"
            | "Completed"
            | "Cancelled"
            | "Upcoming"
            | "In Progress";
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          date: string;
          time: string;
          type: string;
          status:
            | "Scheduled"
            | "Completed"
            | "Cancelled"
            | "Upcoming"
            | "In Progress";
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          date?: string;
          time?: string;
          type?: string;
          status?:
            | "Scheduled"
            | "Completed"
            | "Cancelled"
            | "Upcoming"
            | "In Progress";
          created_at?: string;
        };
      };
      medical_records: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          date: string;
          condition: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          date: string;
          condition: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          date?: string;
          condition?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          date: string;
          medication: string;
          dosage: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          date: string;
          medication: string;
          dosage: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          date?: string;
          medication?: string;
          dosage?: string;
          created_at?: string;
        };
      };
      ipd_patients: {
        Row: {
          id: string;
          patient_id: string;
          room_number: string;
          bed_number: string;
          admission_date: string;
          condition: string;
          severity: "Critical" | "Stable" | "Recovering";
          assigned_doctor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          room_number: string;
          bed_number: string;
          admission_date: string;
          condition: string;
          severity: "Critical" | "Stable" | "Recovering";
          assigned_doctor_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          room_number?: string;
          bed_number?: string;
          admission_date?: string;
          condition?: string;
          severity?: "Critical" | "Stable" | "Recovering";
          assigned_doctor_id?: string | null;
          created_at?: string;
        };
      };
      vitals: {
        Row: {
          id: string;
          ipd_patient_id: string;
          time: string;
          heart_rate: number;
          temperature: number;
          blood_pressure: string;
          oxygen_saturation: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ipd_patient_id: string;
          time: string;
          heart_rate: number;
          temperature: number;
          blood_pressure: string;
          oxygen_saturation: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ipd_patient_id?: string;
          time?: string;
          heart_rate?: number;
          temperature?: number;
          blood_pressure?: string;
          oxygen_saturation?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      medicine_schedule: {
        Row: {
          id: string;
          ipd_patient_id: string;
          time: string;
          medicine: string;
          dosage: string;
          frequency: string;
          status: "Given" | "Pending" | "Scheduled" | "Missed";
          nurse: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ipd_patient_id: string;
          time: string;
          medicine: string;
          dosage: string;
          frequency: string;
          status: "Given" | "Pending" | "Scheduled" | "Missed";
          nurse?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ipd_patient_id?: string;
          time?: string;
          medicine?: string;
          dosage?: string;
          frequency?: string;
          status?: "Given" | "Pending" | "Scheduled" | "Missed";
          nurse?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      iv_schedule: {
        Row: {
          id: string;
          ipd_patient_id: string;
          time: string;
          fluid: string;
          volume: string;
          rate: string;
          status: "Running" | "Completed" | "Scheduled" | "Stopped";
          nurse: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ipd_patient_id: string;
          time: string;
          fluid: string;
          volume: string;
          rate: string;
          status: "Running" | "Completed" | "Scheduled" | "Stopped";
          nurse?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ipd_patient_id?: string;
          time?: string;
          fluid?: string;
          volume?: string;
          rate?: string;
          status?: "Running" | "Completed" | "Scheduled" | "Stopped";
          nurse?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      doctor_visits: {
        Row: {
          id: string;
          ipd_patient_id: string;
          doctor_id: string | null;
          time: string;
          visit_type: string;
          notes: string | null;
          vitals_status:
            | "Stable"
            | "Improving"
            | "Critical"
            | "Declining"
            | null;
          prescription: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ipd_patient_id: string;
          doctor_id?: string | null;
          time: string;
          visit_type: string;
          notes?: string | null;
          vitals_status?:
            | "Stable"
            | "Improving"
            | "Critical"
            | "Declining"
            | null;
          prescription?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ipd_patient_id?: string;
          doctor_id?: string | null;
          time?: string;
          visit_type?: string;
          notes?: string | null;
          vitals_status?:
            | "Stable"
            | "Improving"
            | "Critical"
            | "Declining"
            | null;
          prescription?: string | null;
          created_at?: string;
        };
      };
      bills: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          appointment_id: string | null;
          date: string;
          subtotal: number;
          discount: number;
          total: number;
          status: "Paid" | "Pending" | "Overdue";
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          appointment_id?: string | null;
          date: string;
          subtotal: number;
          discount: number;
          total: number;
          status: "Paid" | "Pending" | "Overdue";
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          appointment_id?: string | null;
          date?: string;
          subtotal?: number;
          discount?: number;
          total?: number;
          status?: "Paid" | "Pending" | "Overdue";
          created_at?: string;
        };
      };
      bill_items: {
        Row: {
          id: string;
          bill_id: string;
          description: string;
          quantity: number;
          rate: number;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          bill_id: string;
          description: string;
          quantity: number;
          rate: number;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          bill_id?: string;
          description?: string;
          quantity?: number;
          rate?: number;
          amount?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
