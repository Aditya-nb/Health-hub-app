# Healthcare RLS Setup Guide

This guide will help you set up Row Level Security (RLS) for your healthcare application with proper role-based access control.

## 🚀 Quick Setup Steps

### 1. Run SQL Files in Order

Go to your **Supabase Dashboard > SQL Editor** and run these files in order:

1. **`src/lib/profiles-setup.sql`** - Creates profiles table and triggers
2. **`src/lib/healthcare-rls-policies.sql`** - Sets up RLS policies
3. **`src/lib/sample-data-setup.sql`** - Adds sample data (optional)

### 2. Create Test Users

In **Supabase Dashboard > Authentication > Users**, click "Add user" to create:

#### Admin User:
- **Email**: `admin@healthcare.com`
- **Password**: `admin123`
- **Confirm Password**: `admin123`

#### Doctor User:
- **Email**: `sarah.johnson@hospital.com`  
- **Password**: `doctor123`
- **Confirm Password**: `doctor123`

### 3. Update User Profiles

After creating users, run these queries in **SQL Editor** (replace USER_ID with actual IDs from auth.users table):

```sql
-- Update admin profile
UPDATE public.profiles SET 
  role = 'admin',
  full_name = 'Admin User',
  department = 'Administration'
WHERE email = 'admin@healthcare.com';

-- Update doctor profile
UPDATE public.profiles SET 
  role = 'doctor',
  full_name = 'Dr. Sarah Johnson',
  department = 'Cardiology',
  doctor_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE email = 'sarah.johnson@hospital.com';
```

## 🔐 How the RLS System Works

### **Role-Based Access Control**

| Role | Access Level |
|------|-------------|
| **Admin** | 👑 Sees ALL data across all tables |
| **Doctor** | 👨‍⚕️ Only sees patients they have relationships with |
| **Nurse** | 👩‍⚕️ Limited access (configurable) |
| **Staff** | 👥 Basic access (configurable) |

### **Doctor Access Rules**

Doctors can only see patients they have relationships with through:
- ✅ **Appointments** they're assigned to
- ✅ **Medical Records** they created or for their patients  
- ✅ **Prescriptions** they wrote or for their patients
- ✅ **IPD Patients** assigned to them
- ✅ **Bills** for their patients
- ✅ **All related IPD data** (vitals, schedules, visits) for their patients

### **Admin Access Rules**

Admins can see everything - perfect for hospital administration, billing, and management.

## 🛠 Code Integration

Your app now uses the new auth system:

### **AuthContext Changes**
```typescript
const { user, profile } = useAuth();
// user = Supabase User object
// profile = Your custom profile with role, doctor_id, etc.
```

### **Role Checking**
```typescript
import { useIsAdmin, useIsDoctor, RoleGuard } from '../components/RoleGuard';

// In components
const isAdmin = useIsAdmin();
const isDoctor = useIsDoctor();

// Or use RoleGuard component
<RoleGuard allowedRoles={['admin', 'doctor']}>
  <AdminOnlyFeature />
</RoleGuard>
```

## 🔍 Troubleshooting

### **No Data Showing?**
1. Check if RLS policies are enabled: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;`
2. Verify user profile exists: `SELECT * FROM profiles WHERE email = 'your-email';`
3. Check if doctor_id is set for doctor users
4. Ensure sample data relationships are correct

### **Access Denied Errors?**
1. Verify user role in profiles table
2. Check if doctor has appointments/records with patients
3. Ensure foreign key relationships are set up correctly

### **Authentication Issues?**
1. Check Supabase environment variables
2. Verify auth triggers are working
3. Check browser console for detailed errors

## 📊 Test the System

### **As Admin** (`admin@healthcare.com`):
- Should see all patients, doctors, appointments
- Full dashboard access
- Can view all IPD patients and schedules

### **As Doctor** (`sarah.johnson@hospital.com`):
- Should only see patients John Smith (cardiac patient) 
- Only appointments and records for assigned patients
- Limited IPD view to assigned patients only

## 🏥 Production Considerations

### **HIPAA Compliance**
- ✅ RLS ensures doctors only see their patients
- ✅ Audit trails available through Supabase logs
- ✅ Role-based access controls in place

### **Security Features**
- 🔐 Row-level security on all tables
- 🔐 Profile-based role management
- 🔐 Automatic profile creation on signup
- 🔐 Doctor-patient relationship validation

### **Scalability**
- 📈 Efficient queries with proper indexing
- 📈 Profile system supports additional roles
- 📈 Easy to extend for departments, specializations

## 🎯 Next Steps

1. **Test both user types** to verify access controls
2. **Add more users** as needed for your team
3. **Customize roles** in the profiles table constraint
4. **Add department-based access** if needed
5. **Set up audit logging** for compliance

---

Your healthcare app is now secured with proper RLS! 🎉

Doctors can only see their patients' data, admins can manage everything, and you're ready for HIPAA compliance. 