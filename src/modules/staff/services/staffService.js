/**
 * Staff Hub Service
 * Manage employees, attendance, and payroll
 */

const STAFF_KEY = 'zetta_staff';
const ATTENDANCE_KEY = 'zetta_attendance';

// Roles
export const ROLES = {
    DOCTOR: 'Doctor',
    MANAGER: 'Manager',
    PHARMACIST: 'Pharmacist',
    CASHIER: 'Cashier',
    HELPER: 'Helper'
};

// Attendance Status
export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    HALF_DAY: 'half_day',
    LEAVE: 'leave',
    HOLIDAY: 'holiday'
};

/**
 * Get all staff members
 */
export const getAllStaff = (tenantId) => {
    try {
        const data = localStorage.getItem(STAFF_KEY);
        let staff = data ? JSON.parse(data) : [];

        // Filter by tenant
        staff = staff.filter(s => s.tenantId === tenantId);

        // Init demo staff if empty
        if (staff.length === 0 && tenantId === 'demo_shop') {
            staff = initDemoStaff();
        }

        return staff;
    } catch (e) {
        console.error('Error getting staff:', e);
        return [];
    }
};

/**
 * Add new staff member
 */
export const addStaff = (staffData) => {
    const allStaff = getAllAllStaffFromStorage();
    const newStaff = {
        id: `staff_${Date.now()}`,
        ...staffData,
        status: 'active',
        joinDate: staffData.joinDate || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    allStaff.push(newStaff);
    saveStaff(allStaff);
    return newStaff;
};

/**
 * Update staff member
 */
export const updateStaff = (staffId, updates) => {
    const allStaff = getAllAllStaffFromStorage();
    const index = allStaff.findIndex(s => s.id === staffId);

    if (index !== -1) {
        allStaff[index] = { ...allStaff[index], ...updates };
        saveStaff(allStaff);
        return allStaff[index];
    }
    return null;
};

/**
 * Delete staff member (soft delete)
 */
export const deleteStaff = (staffId) => {
    const allStaff = getAllAllStaffFromStorage();
    const index = allStaff.findIndex(s => s.id === staffId);

    if (index !== -1) {
        allStaff[index].status = 'inactive';
        saveStaff(allStaff);
        return true;
    }
    return false;
};

// --- Attendance Section ---

/**
 * Get attendance for a specific date
 */
export const getAttendanceByDate = (tenantId, date) => {
    const dateStr = new Date(date).toISOString().split('T')[0];
    const allAttendance = getAllAttendanceFromStorage();

    // Filter by tenant and date
    return allAttendance.filter(a => a.tenantId === tenantId && a.date === dateStr);
};

/**
 * Mark attendance for an employee
 */
export const markAttendance = (attendanceData) => {
    const allAttendance = getAllAttendanceFromStorage();
    const dateStr = new Date(attendanceData.date).toISOString().split('T')[0];

    // Check if already exists
    const index = allAttendance.findIndex(a =>
        a.staffId === attendanceData.staffId &&
        a.date === dateStr
    );

    const record = {
        ...attendanceData,
        date: dateStr,
        updatedAt: new Date().toISOString()
    };

    if (index !== -1) {
        allAttendance[index] = { ...allAttendance[index], ...record };
    } else {
        allAttendance.push({
            id: `att_${Date.now()}`,
            ...record,
            createdAt: new Date().toISOString()
        });
    }

    saveAttendance(allAttendance);
    return record;
};

/**
 * Get monthly attendance summary for an employee
 */
export const getMonthlyAttendance = (staffId, month, year) => {
    const allAttendance = getAllAttendanceFromStorage();

    return allAttendance.filter(a => {
        if (a.staffId !== staffId) return false;
        const d = new Date(a.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });
};

/**
 * Calculate payroll for a month
 */
export const calculatePayroll = (staffId, month, year) => {
    const staff = getAllAllStaffFromStorage().find(s => s.id === staffId);
    if (!staff) return null;

    const attendance = getMonthlyAttendance(staffId, month, year);

    let presentDays = 0;
    let halfDays = 0;

    attendance.forEach(a => {
        if (a.status === ATTENDANCE_STATUS.PRESENT) presentDays++;
        if (a.status === ATTENDANCE_STATUS.HALF_DAY) halfDays++;
    });

    // Simple calculation: Base / 30 * (Present + Half/2)
    // In a real system, this would be more complex
    const totalWorkingDays = presentDays + (halfDays * 0.5);
    const dailyRate = staff.salary / 30; // Assuming 30 days month
    const estimatedSalary = Math.round(dailyRate * totalWorkingDays);

    return {
        staffId,
        staffName: staff.name,
        month,
        year,
        baseSalary: staff.salary,
        presentDays,
        halfDays,
        leaves: 30 - totalWorkingDays, // Simplified
        estimatedSalary
    };
};

// --- Helpers ---

const getAllAllStaffFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem(STAFF_KEY) || '[]');
    } catch { return []; }
};

const saveStaff = (staff) => localStorage.setItem(STAFF_KEY, JSON.stringify(staff));

const getAllAttendanceFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
    } catch { return []; }
};

const saveAttendance = (data) => localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));

// --- Demo Data ---

const initDemoStaff = () => {
    const demoStaff = [
        {
            id: 'staff_1',
            tenantId: 'demo_shop',
            name: 'Rahul Kumar',
            role: ROLES.MANAGER,
            phone: '9876543210',
            salary: 25000,
            status: 'active',
            joinDate: '2025-01-01',
            photo: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        },
        {
            id: 'staff_2',
            tenantId: 'demo_shop',
            name: 'Priya Singh',
            role: ROLES.PHARMACIST,
            phone: '9876543211',
            salary: 20000,
            status: 'active',
            joinDate: '2025-02-15',
            photo: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png'
        },
        {
            id: 'staff_3',
            tenantId: 'demo_shop',
            name: 'Amit Sharma',
            role: ROLES.HELPER,
            phone: '9876543212',
            salary: 12000,
            status: 'active',
            joinDate: '2025-03-10',
            photo: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        }
    ];

    saveStaff(demoStaff);

    // Generate some random attendance for this month
    const now = new Date();
    const attendance = [];
    const statuses = [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.ABSENT, ATTENDANCE_STATUS.HALF_DAY];

    for (let d = 1; d <= now.getDate(); d++) {
        const dateStr = new Date(now.getFullYear(), now.getMonth(), d).toISOString().split('T')[0];
        demoStaff.forEach(s => {
            attendance.push({
                id: `att_${d}_${s.id}`,
                tenantId: 'demo_shop',
                staffId: s.id,
                date: dateStr,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                checkIn: '09:00',
                checkOut: '18:00',
                createdAt: new Date().toISOString()
            });
        });
    }

    saveAttendance(attendance);
    return demoStaff;
};
