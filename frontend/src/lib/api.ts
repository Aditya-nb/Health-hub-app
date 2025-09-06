const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Auth interfaces
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  department?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  phone?: string;
  department?: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
  expires_at: number;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Initialize token from localStorage
    this.accessToken = localStorage.getItem("access_token");
  }

  setToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  getToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      // Add authorization header if token exists
      if (this.accessToken) {
        headers.Authorization = `Bearer ${this.accessToken}`;
      }

      const config: RequestInit = {
        credentials: "include", // Include cookies
        headers,
        ...options,
      };

      if (
        config.body &&
        typeof config.body === "object" &&
        config.body !== null &&
        typeof config.body !== "string"
      ) {
        config.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, config);

      // Handle 401 unauthorized - redirect to login
      if (response.status === 401) {
        this.setToken(null);
        // Only redirect if we're not already on the auth pages
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          window.location.href = "/login";
        }
        throw new Error("Authentication required");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Generic CRUD operations
  async get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return this.request<T>(`${endpoint}${queryString}`);
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data,
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  // Specific API methods

  // Authentication
  auth = {
    login: (data: LoginRequest) => this.post<AuthResponse>("/auth/login", data),
    register: (data: RegisterRequest) =>
      this.post<{ message: string; user: AuthUser }>("/auth/register", data),
    logout: () => this.post<{ message: string }>("/auth/logout", {}),
    getCurrentUser: () => this.get<AuthUser>("/auth/me"),
    checkAuth: () => this.get<{ authenticated: boolean }>("/auth/check"),
    refreshToken: () => this.post<AuthResponse>("/auth/refresh", {}),
  };

  // Patients
  patients = {
    getAll: (search?: string) =>
      this.get<any[]>("/patients", search ? { search } : undefined),
    getById: (id: string) => this.get<any>(`/patients/${id}`),
    create: (data: any) => this.post<any>("/patients", data),
    update: (id: string, data: any) => this.patch<any>(`/patients/${id}`, data),
    delete: (id: string) => this.delete(`/patients/${id}`),
  };

  // Doctors
  doctors = {
    getAll: () => this.get<any[]>("/doctors"),
    getById: (id: string) => this.get<any>(`/doctors/${id}`),
    create: (data: any) => this.post<any>("/doctors", data),
    update: (id: string, data: any) => this.patch<any>(`/doctors/${id}`, data),
    delete: (id: string) => this.delete(`/doctors/${id}`),
  };

  // Appointments
  appointments = {
    getAll: (params?: { patientId?: string; doctorId?: string }) =>
      this.get<any[]>("/appointments", params),
    getById: (id: string) => this.get<any>(`/appointments/${id}`),
    create: (data: any) => this.post<any>("/appointments", data),
    update: (id: string, data: any) =>
      this.patch<any>(`/appointments/${id}`, data),
    delete: (id: string) => this.delete(`/appointments/${id}`),
  };

  // Medical Records
  medicalRecords = {
    getAll: (patientId?: string) =>
      this.get<any[]>(
        "/medical-records",
        patientId ? { patientId } : undefined
      ),
    getById: (id: string) => this.get<any>(`/medical-records/${id}`),
    create: (data: any) => this.post<any>("/medical-records", data),
    update: (id: string, data: any) =>
      this.patch<any>(`/medical-records/${id}`, data),
    delete: (id: string) => this.delete(`/medical-records/${id}`),
  };

  // Vitals
  vitals = {
    getAll: (params?: {
      ipdPatientId?: string;
      startDate?: string;
      endDate?: string;
      hours?: number;
      latest?: boolean;
    }) => this.get<any[]>("/vitals", params as Record<string, string>),
    getById: (id: string) => this.get<any>(`/vitals/${id}`),
    create: (data: any) => this.post<any>("/vitals", data),
    update: (id: string, data: any) => this.patch<any>(`/vitals/${id}`, data),
    delete: (id: string) => this.delete(`/vitals/${id}`),
  };

  // Prescriptions
  prescriptions = {
    getAll: (params?: {
      patientId?: string;
      doctorId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    }) => this.get<any[]>("/prescriptions", params),
    getById: (id: string) => this.get<any>(`/prescriptions/${id}`),
    create: (data: any) => this.post<any>("/prescriptions", data),
    update: (id: string, data: any) =>
      this.patch<any>(`/prescriptions/${id}`, data),
    delete: (id: string) => this.delete(`/prescriptions/${id}`),
  };

  // IPD Patients
  ipdPatients = {
    getAll: (params?: {
      doctorId?: string;
      severity?: string;
      roomNumber?: string;
      search?: string;
    }) => this.get<any[]>("/ipd-patients", params),
    getById: (id: string) => this.get<any>(`/ipd-patients/${id}`),
    create: (data: any) => this.post<any>("/ipd-patients", data),
    update: (id: string, data: any) =>
      this.patch<any>(`/ipd-patients/${id}`, data),
    delete: (id: string) => this.delete(`/ipd-patients/${id}`),
  };

  // Medicine Schedule
  medicineSchedule = {
    getAll: (params?: {
      ipdPatientId?: string;
      status?: string;
      nurse?: string;
      date?: string;
      search?: string;
    }) => this.get<any[]>("/medicine-schedule", params),
    getById: (id: string) => this.get<any>(`/medicine-schedule/${id}`),
    create: (data: any) => this.post<any>("/medicine-schedule", data),
    update: (id: string, data: any) =>
      this.patch<any>(`/medicine-schedule/${id}`, data),
    delete: (id: string) => this.delete(`/medicine-schedule/${id}`),
  };

  // IV Schedule
  ivSchedule = {
    getAll: (params?: {
      ipdPatientId?: string;
      status?: string;
      nurse?: string;
    }) => this.get<any[]>("/iv-schedule", params),
    getById: (id: string) => this.get<any>(`/iv-schedule/${id}`),
    create: (data: any) => this.post<any>("/iv-schedule", data),
    update: (id: string, data: any) =>
      this.patch<any>(`/iv-schedule/${id}`, data),
    delete: (id: string) => this.delete(`/iv-schedule/${id}`),
  };

  // Doctor Visits
  doctorVisits = {
    getAll: (params?: { ipdPatientId?: string; doctorId?: string }) =>
      this.get<any[]>("/doctor-visits", params),
    getById: (id: string) => this.get<any>(`/doctor-visits/${id}`),
    create: (data: any) => this.post<any>("/doctor-visits", data),
    update: (id: string, data: any) =>
      this.patch<any>(`/doctor-visits/${id}`, data),
    delete: (id: string) => this.delete(`/doctor-visits/${id}`),
  };

  // Bills
  bills = {
    getAll: (params?: {
      patientId?: string;
      doctorId?: string;
      status?: string;
    }) => this.get<any[]>("/bills", params),
    getById: (id: string) => this.get<any>(`/bills/${id}`),
    create: (data: any) => this.post<any>("/bills", data),
    update: (id: string, data: any) => this.patch<any>(`/bills/${id}`, data),
    delete: (id: string) => this.delete(`/bills/${id}`),
  };

  // Bill Items
  billItems = {
    getAll: (params?: { billId?: string }) =>
      this.get<any[]>("/bill-items", params),
    getById: (id: string) => this.get<any>(`/bill-items/${id}`),
    create: (data: any) => this.post<any>("/bill-items", data),
    update: (id: string, data: any) =>
      this.patch<any>(`/bill-items/${id}`, data),
    delete: (id: string) => this.delete(`/bill-items/${id}`),
  };
}

export const api = new ApiClient(API_BASE_URL);
export default api;
