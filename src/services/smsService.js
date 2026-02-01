import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { isDemoMode } from '../core/demo/demoManager';

const SMS_QUEUE = 'sms_queue';

export const smsService = {
    /**
     * Send generic SMS
     * @param {string} to - Phone number
     * @param {string} body - Message body
     * @param {string} type - 'transactional' or 'promotional'
     */
    sendSMS: async (to, body, type = 'transactional') => {
        try {
            if (isDemoMode()) {
                console.info(`%c[SMS MOCK] To: ${to}\nBody: ${body}`, 'color: #3b82f6; font-weight: bold;');
                return true;
            }

            // Production: Write to Firestore queue for Extension/Cloud Function
            await addDoc(collection(db, SMS_QUEUE), {
                to,
                body,
                type,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error sending SMS:', error);
            return false;
        }
    },

    /**
     * Send Appointment Confirmation
     */
    sendAppointmentConfirmation: async (appointment) => {
        if (!appointment.patientPhone) return;

        const date = new Date(appointment.appointmentDateTime).toLocaleDateString();
        const time = new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const message = `Dear ${appointment.patientName}, your appointment with ${appointment.doctorName} is confirmed for ${date} at ${time}. - Zetta Medical`;

        return smsService.sendSMS(appointment.patientPhone, message);
    },

    /**
     * Send Appointment Reminder
     */
    sendReminder: async (appointment) => {
        if (!appointment.patientPhone) return;

        const time = new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const message = `Reminder: You have an appointment today at ${time} with ${appointment.doctorName}. Please arrive 10 mins early. - Zetta Medical`;

        return smsService.sendSMS(appointment.patientPhone, message);
    },

    /**
     * Send Cancellation Alert
     */
    sendCancellation: async (appointment, reason) => {
        if (!appointment.patientPhone) return;

        const message = `Alert: Your appointment with ${appointment.doctorName} has been cancelled. Reason: ${reason || 'Unavoidable circumstances'}. Please reschedule. - Zetta Medical`;

        return smsService.sendSMS(appointment.patientPhone, message);
    }
};
