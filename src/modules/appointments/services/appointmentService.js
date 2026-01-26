/**
 * Appointment Service
 * Manage appointments, scheduling, and patient queue
 */

const APPOINTMENTS_KEY = 'zetta_appointments';

// Appointment Types
export const APPOINTMENT_TYPES = {
    NEW_CONSULTATION: 'New Consultation',
    FOLLOW_UP: 'Follow-up',
    EMERGENCY: 'Emergency',
    ROUTINE_CHECKUP: 'Routine Checkup'
};

// Appointment Status
export const APPOINTMENT_STATUS = {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show'
};

/**
 * Get all appointments for a tenant
 */
export const getAllAppointments = (tenantId) => {
    try {
        const data = localStorage.getItem(APPOINTMENTS_KEY);
        let appointments = data ? JSON.parse(data) : [];

        // Filter by tenant
        appointments = appointments.filter(a => a.tenantId === tenantId);

        // Init demo appointments if empty for clinic
        if (appointments.length === 0 && tenantId === 'demo_clinic') {
            appointments = initDemoAppointments(tenantId);
        }

        return appointments.sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime));
    } catch (e) {
        console.error('Error getting appointments:', e);
        return [];
    }
};

/**
 * Get appointments for a specific date
 */
export const getAppointmentsByDate = (tenantId, date) => {
    const appointments = getAllAppointments(tenantId);
    const dateStr = new Date(date).toISOString().split('T')[0];

    return appointments.filter(a => {
        const apptDate = new Date(a.appointmentDateTime).toISOString().split('T')[0];
        return apptDate === dateStr;
    });
};

/**
 * Get today's appointments
 */
export const getTodayAppointments = (tenantId) => {
    return getAppointmentsByDate(tenantId, new Date());
};

/**
 * Get appointments by doctor
 */
export const getAppointmentsByDoctor = (doctorId) => {
    const allAppointments = getAllAppointmentsFromStorage();
    return allAppointments.filter(a => a.doctorId === doctorId);
};

/**
 * Get appointments by patient
 */
export const getAppointmentsByPatient = (patientId) => {
    const allAppointments = getAllAppointmentsFromStorage();
    return allAppointments.filter(a => a.patientId === patientId);
};

/**
 * Create new appointment
 */
export const createAppointment = (appointmentData) => {
    const allAppointments = getAllAppointmentsFromStorage();
    const newAppointment = {
        id: `APT${Date.now()}`,
        ...appointmentData,
        status: APPOINTMENT_STATUS.SCHEDULED,
        paid: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    allAppointments.push(newAppointment);
    saveAppointments(allAppointments);
    return newAppointment;
};

/**
 * Update appointment
 */
export const updateAppointment = (appointmentId, updates) => {
    const allAppointments = getAllAppointmentsFromStorage();
    const index = allAppointments.findIndex(a => a.id === appointmentId);

    if (index !== -1) {
        allAppointments[index] = {
            ...allAppointments[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        saveAppointments(allAppointments);
        return allAppointments[index];
    }
    return null;
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = (appointmentId, status) => {
    return updateAppointment(appointmentId, { status });
};

/**
 * Cancel appointment
 */
export const cancelAppointment = (appointmentId, reason) => {
    return updateAppointment(appointmentId, {
        status: APPOINTMENT_STATUS.CANCELLED,
        cancellationReason: reason
    });
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = (appointmentId) => {
    const allAppointments = getAllAppointmentsFromStorage();
    return allAppointments.find(a => a.id === appointmentId);
};

// --- Helpers ---

const getAllAppointmentsFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
    } catch { return []; }
};

const saveAppointments = (appointments) => {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
};

// --- Demo Data ---

const initDemoAppointments = (tenantId) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const demoAppointments = [
        {
            id: 'APT001',
            tenantId,
            patientId: 'PAT001',
            patientName: 'Ramesh Kumar',
            patientPhone: '9876543210',
            doctorId: 'staff_doctor_1',
            doctorName: 'Dr. Amit Sharma',
            appointmentDateTime: `${today.toISOString().split('T')[0]}T10:00:00`,
            slotDuration: 15,
            type: APPOINTMENT_TYPES.NEW_CONSULTATION,
            chiefComplaint: 'Fever and headache since 3 days',
            status: APPOINTMENT_STATUS.SCHEDULED,
            consultationFee: 500,
            paid: false,
            createdAt: new Date(today.getTime() - 86400000).toISOString()
        },
        {
            id: 'APT002',
            tenantId,
            patientId: 'PAT002',
            patientName: 'Priya Sharma',
            patientPhone: '9876543211',
            doctorId: 'staff_doctor_1',
            doctorName: 'Dr. Amit Sharma',
            appointmentDateTime: `${today.toISOString().split('T')[0]}T11:00:00`,
            slotDuration: 15,
            type: APPOINTMENT_TYPES.FOLLOW_UP,
            chiefComplaint: 'Follow-up for hypertension',
            status: APPOINTMENT_STATUS.CONFIRMED,
            consultationFee: 300,
            paid: true,
            createdAt: new Date(today.getTime() - 172800000).toISOString()
        },
        {
            id: 'APT003',
            tenantId,
            patientId: 'PAT003',
            patientName: 'Amit Patel',
            patientPhone: '9876543212',
            doctorId: 'staff_doctor_1',
            doctorName: 'Dr. Amit Sharma',
            appointmentDateTime: `${today.toISOString().split('T')[0]}T14:30:00`,
            slotDuration: 15,
            type: APPOINTMENT_TYPES.ROUTINE_CHECKUP,
            chiefComplaint: 'General health checkup',
            status: APPOINTMENT_STATUS.SCHEDULED,
            consultationFee: 500,
            paid: false,
            createdAt: new Date(today.getTime() - 259200000).toISOString()
        },
        {
            id: 'APT004',
            tenantId,
            patientId: 'PAT004',
            patientName: 'Sunita Devi',
            patientPhone: '9876543213',
            doctorId: 'staff_doctor_1',
            doctorName: 'Dr. Amit Sharma',
            appointmentDateTime: `${tomorrow.toISOString().split('T')[0]}T09:30:00`,
            slotDuration: 15,
            type: APPOINTMENT_TYPES.FOLLOW_UP,
            chiefComplaint: 'Thyroid medication review',
            status: APPOINTMENT_STATUS.SCHEDULED,
            consultationFee: 300,
            paid: false,
            createdAt: new Date().toISOString()
        }
    ];

    saveAppointments(demoAppointments);
    return demoAppointments;
};
