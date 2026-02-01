/**
 * MailService - Handles email notifications
 * 
 * Supports two modes:
 * 1. 'extension': Uses Firebase "Trigger Email" extension (production recommended)
 * 2. 'client': Uses client-side logic (e.g. console.log or EmailJS) for testing
 */

const MODE = 'client'; // 'extension' or 'client'

export const mailService = {
    /**
     * Send approval email to tenant/user
     */
    sendApprovalEmail: async (userEmail, userName, planName) => {
        try {
            console.log(`[MailService] Sending Approval Email to ${userEmail}`);

            if (MODE === 'extension') {
                // Write to 'mail' collection for Firebase Extension
                // await addDoc(collection(db, 'mail'), { ... });
            } else {
                // Mock implementation
                console.info(`
                Subject: Welcome to Zetta POS!
                To: ${userEmail}
                Hi ${userName},
                
                Your account has been approved! You are on the ${planName} plan.
                Login here: ${window.location.origin}/login
                `);
            }
            return true;
        } catch (error) {
            console.error('[MailService] Failed to send approval email', error);
            return false;
        }
    },

    /**
     * Send rejection email
     */
    sendRejectionEmail: async (userEmail, userName) => {
        try {
            console.log(`[MailService] Sending Rejection Email to ${userEmail}`);

            if (MODE === 'extension') {
                // Write to 'mail' collection
            } else {
                // Mock implementation
                console.info(`
                Subject: Update on your Zetta POS Account
                To: ${userEmail}
                Hi ${userName},
                
                Unfortunately, your request has been declined. Please contact support.
                `);
            }
            return true;
        } catch (error) {
            console.error('[MailService] Failed to send rejection email', error);
            return false;
        }
    }
};
