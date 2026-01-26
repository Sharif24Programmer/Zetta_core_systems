/**
 * Prescription PDF Service
 * Generates prescription PDFs for clinic visits
 */

/**
 * Generate prescription HTML
 */
export const generatePrescriptionHTML = (prescription, patient, tenant) => {
    const { medicines = [], diagnosis, notes, doctor, date } = prescription;

    const medicineRows = medicines.map((med, i) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <strong>${med.name}</strong>
        ${med.genericName ? `<br><small style="color: #666;">${med.genericName}</small>` : ''}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.dosage || '-'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.frequency || '-'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.duration || '-'}</td>
    </tr>
  `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Prescription - ${patient.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { font-size: 24px; color: #1e40af; }
        .header p { color: #666; font-size: 12px; margin-top: 5px; }
        .patient-info { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 10px; background: #f8fafc; border-radius: 8px; }
        .patient-info div { flex: 1; }
        .patient-info label { font-size: 11px; color: #64748b; display: block; }
        .patient-info span { font-weight: 600; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e40af; color: white; padding: 10px 8px; text-align: left; font-size: 12px; }
        .diagnosis { padding: 10px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; }
        .notes { padding: 10px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature { text-align: right; }
        .signature-line { width: 200px; border-bottom: 1px solid #333; margin-bottom: 5px; margin-left: auto; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${tenant?.name || 'Clinic'}</h1>
        <p>${tenant?.address || ''}</p>
        <p style="margin-top: 10px; font-size: 14px;">📋 PRESCRIPTION</p>
      </div>

      <div class="patient-info">
        <div>
          <label>Patient Name</label>
          <span>${patient.name}</span>
        </div>
        <div>
          <label>Age / Gender</label>
          <span>${patient.age || '-'} / ${patient.gender || '-'}</span>
        </div>
        <div>
          <label>Date</label>
          <span>${new Date(date || Date.now()).toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      ${diagnosis ? `
        <div class="section">
          <div class="section-title">Diagnosis</div>
          <div class="diagnosis">${diagnosis}</div>
        </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Medicines</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Medicine</th>
              <th style="width: 100px;">Dosage</th>
              <th style="width: 100px;">Frequency</th>
              <th style="width: 80px;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${medicineRows || '<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">No medicines prescribed</td></tr>'}
          </tbody>
        </table>
      </div>

      ${notes ? `
        <div class="section">
          <div class="section-title">Notes / Advice</div>
          <div class="notes">${notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        <div>
          <small style="color: #999;">Generated on ${new Date().toLocaleString('en-IN')}</small>
        </div>
        <div class="signature">
          <div class="signature-line"></div>
          <strong>${doctor?.name || 'Doctor'}</strong>
          <br><small style="color: #666;">${doctor?.qualification || ''}</small>
        </div>
      </div>

      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 12px 24px; background: #1e40af; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          🖨️ Print Prescription
        </button>
      </div>
    </body>
    </html>
  `;
};

/**
 * Print prescription
 */
export const printPrescription = (prescription, patient, tenant) => {
    const html = generatePrescriptionHTML(prescription, patient, tenant);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
};

/**
 * Generate prescription data for API/storage
 */
export const createPrescriptionData = (visitId, patientId, medicines, options = {}) => {
    return {
        visitId,
        patientId,
        medicines: medicines.map(m => ({
            name: m.name,
            genericName: m.genericName || null,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            instructions: m.instructions || null
        })),
        diagnosis: options.diagnosis || null,
        notes: options.notes || null,
        createdAt: new Date()
    };
};

/**
 * Share prescription via WhatsApp (text format)
 */
export const sharePrescriptionWhatsApp = (prescription, patient, tenant) => {
    const medicines = prescription.medicines?.map((m, i) =>
        `${i + 1}. ${m.name} - ${m.dosage || ''} - ${m.frequency || ''} (${m.duration || ''})`
    ).join('\n') || 'No medicines';

    const text = `
📋 *PRESCRIPTION*
${tenant?.name || 'Clinic'}
━━━━━━━━━━━━━━
*Patient:* ${patient.name}
*Date:* ${new Date().toLocaleDateString('en-IN')}
${prescription.diagnosis ? `*Diagnosis:* ${prescription.diagnosis}` : ''}
━━━━━━━━━━━━━━
*Medicines:*
${medicines}

${prescription.notes ? `*Notes:* ${prescription.notes}` : ''}
━━━━━━━━━━━━━━
Get well soon! 💊
  `.trim();

    const phone = patient.phone?.replace(/\D/g, '') || '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
};
