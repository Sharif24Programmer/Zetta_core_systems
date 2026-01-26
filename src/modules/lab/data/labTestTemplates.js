/**
 * Lab Test Templates
 * Pre-configured lab tests with parameters and reference ranges
 */

export const LAB_CATEGORIES = {
    HEMATOLOGY: 'Hematology',
    BIOCHEMISTRY: 'Clinical Biochemistry',
    SEROLOGY: 'Serology & Immunology',
    MICROBIOLOGY: 'Microbiology',
    PATHOLOGY: 'Pathology'
};

export const SAMPLE_TYPES = {
    BLOOD: 'Blood',
    URINE: 'Urine',
    STOOL: 'Stool',
    SERUM: 'Serum',
    PLASMA: 'Plasma'
};

export const LAB_TEST_TEMPLATES = [
    // 1. COMPLETE BLOOD COUNT (CBC)
    {
        id: 'TEST_CBC',
        testCode: 'CBC',
        testName: 'Complete Blood Count (CBC)',
        category: LAB_CATEGORIES.HEMATOLOGY,
        sampleType: SAMPLE_TYPES.BLOOD,
        sampleVolume: '2-3 ml',
        containerType: 'EDTA tube (Purple cap)',
        turnaroundTime: 4, // hours
        fasting: false,
        basePrice: 500,
        urgentPrice: 800,
        patientInstructions: 'No special preparation required',
        collectionInstructions: 'Collect in EDTA tube, mix gently by inversion',
        parameters: [
            {
                id: 'CBC_HB',
                name: 'Hemoglobin',
                shortName: 'Hb',
                unit: 'g/dL',
                normalRange: {
                    male: { min: 13.5, max: 17.5 },
                    female: { min: 12.0, max: 15.5 },
                    child: { min: 11.0, max: 14.0 }
                },
                criticalLow: 7.0,
                criticalHigh: 20.0,
                order: 1
            },
            {
                id: 'CBC_WBC',
                name: 'Total WBC Count',
                shortName: 'WBC',
                unit: 'cells/μL',
                normalRange: { general: { min: 4000, max: 11000 } },
                criticalLow: 2000,
                criticalHigh: 30000,
                order: 2
            },
            {
                id: 'CBC_RBC',
                name: 'RBC Count',
                shortName: 'RBC',
                unit: 'million/μL',
                normalRange: {
                    male: { min: 4.5, max: 6.0 },
                    female: { min: 4.0, max: 5.5 }
                },
                order: 3
            },
            {
                id: 'CBC_PLATELETS',
                name: 'Platelet Count',
                shortName: 'Platelets',
                unit: 'lakhs/μL',
                normalRange: { general: { min: 1.5, max: 4.5 } },
                criticalLow: 0.5,
                criticalHigh: 10.0,
                order: 4
            },
            {
                id: 'CBC_HCT',
                name: 'Hematocrit',
                shortName: 'HCT',
                unit: '%',
                normalRange: {
                    male: { min: 40, max: 54 },
                    female: { min: 36, max: 48 }
                },
                order: 5
            },
            {
                id: 'CBC_MCV',
                name: 'Mean Corpuscular Volume',
                shortName: 'MCV',
                unit: 'fL',
                normalRange: { general: { min: 80, max: 100 } },
                order: 6
            },
            {
                id: 'CBC_MCH',
                name: 'Mean Corpuscular Hemoglobin',
                shortName: 'MCH',
                unit: 'pg',
                normalRange: { general: { min: 27, max: 32 } },
                order: 7
            },
            {
                id: 'CBC_MCHC',
                name: 'Mean Corpuscular Hemoglobin Concentration',
                shortName: 'MCHC',
                unit: 'g/dL',
                normalRange: { general: { min: 32, max: 36 } },
                order: 8
            }
        ]
    },

    // 2. LIPID PROFILE
    {
        id: 'TEST_LIPID',
        testCode: 'LIPID',
        testName: 'Lipid Profile',
        category: LAB_CATEGORIES.BIOCHEMISTRY,
        sampleType: SAMPLE_TYPES.SERUM,
        sampleVolume: '3-5 ml',
        containerType: 'Plain tube (Red cap)',
        turnaroundTime: 6,
        fasting: true,
        basePrice: 600,
        urgentPrice: 900,
        patientInstructions: '12-14 hours fasting required. Water is allowed.',
        collectionInstructions: 'Collect fasting sample, separate serum',
        parameters: [
            {
                id: 'LIPID_CHOL',
                name: 'Total Cholesterol',
                shortName: 'Total Chol',
                unit: 'mg/dL',
                normalRange: { general: { min: 0, max: 200 } },
                criticalHigh: 300,
                order: 1
            },
            {
                id: 'LIPID_TG',
                name: 'Triglycerides',
                shortName: 'TG',
                unit: 'mg/dL',
                normalRange: { general: { min: 0, max: 150 } },
                criticalHigh: 500,
                order: 2
            },
            {
                id: 'LIPID_HDL',
                name: 'HDL Cholesterol',
                shortName: 'HDL',
                unit: 'mg/dL',
                normalRange: { general: { min: 40, max: 60 } },
                criticalLow: 20,
                order: 3
            },
            {
                id: 'LIPID_LDL',
                name: 'LDL Cholesterol',
                shortName: 'LDL',
                unit: 'mg/dL',
                normalRange: { general: { min: 0, max: 100 } },
                criticalHigh: 190,
                order: 4
            },
            {
                id: 'LIPID_VLDL',
                name: 'VLDL Cholesterol',
                shortName: 'VLDL',
                unit: 'mg/dL',
                normalRange: { general: { min: 0, max: 30 } },
                order: 5
            }
        ]
    },

    // 3. LIVER FUNCTION TEST (LFT)
    {
        id: 'TEST_LFT',
        testCode: 'LFT',
        testName: 'Liver Function Test (LFT)',
        category: LAB_CATEGORIES.BIOCHEMISTRY,
        sampleType: SAMPLE_TYPES.SERUM,
        sampleVolume: '3-5 ml',
        containerType: 'Plain tube (Red cap)',
        turnaroundTime: 6,
        fasting: false,
        basePrice: 700,
        urgentPrice: 1000,
        patientInstructions: 'No special preparation required',
        collectionInstructions: 'Separate serum, avoid hemolysis',
        parameters: [
            {
                id: 'LFT_BILIRUBIN_TOTAL',
                name: 'Total Bilirubin',
                shortName: 'T. Bilirubin',
                unit: 'mg/dL',
                normalRange: { general: { min: 0.3, max: 1.2 } },
                criticalHigh: 15,
                order: 1
            },
            {
                id: 'LFT_BILIRUBIN_DIRECT',
                name: 'Direct Bilirubin',
                shortName: 'D. Bilirubin',
                unit: 'mg/dL',
                normalRange: { general: { min: 0, max: 0.3 } },
                order: 2
            },
            {
                id: 'LFT_SGOT',
                name: 'SGOT (AST)',
                shortName: 'SGOT',
                unit: 'U/L',
                normalRange: { general: { min: 0, max: 40 } },
                criticalHigh: 300,
                order: 3
            },
            {
                id: 'LFT_SGPT',
                name: 'SGPT (ALT)',
                shortName: 'SGPT',
                unit: 'U/L',
                normalRange: { general: { min: 0, max: 40 } },
                criticalHigh: 300,
                order: 4
            },
            {
                id: 'LFT_ALP',
                name: 'Alkaline Phosphatase',
                shortName: 'ALP',
                unit: 'U/L',
                normalRange: { general: { min: 30, max: 120 } },
                order: 5
            },
            {
                id: 'LFT_PROTEIN_TOTAL',
                name: 'Total Protein',
                shortName: 'T. Protein',
                unit: 'g/dL',
                normalRange: { general: { min: 6.0, max: 8.3 } },
                order: 6
            },
            {
                id: 'LFT_ALBUMIN',
                name: 'Albumin',
                shortName: 'Albumin',
                unit: 'g/dL',
                normalRange: { general: { min: 3.5, max: 5.5 } },
                order: 7
            },
            {
                id: 'LFT_GLOBULIN',
                name: 'Globulin',
                shortName: 'Globulin',
                unit: 'g/dL',
                normalRange: { general: { min: 2.0, max: 3.5 } },
                order: 8
            }
        ]
    },

    // 4. KIDNEY FUNCTION TEST (KFT)
    {
        id: 'TEST_KFT',
        testCode: 'KFT',
        testName: 'Kidney Function Test (KFT)',
        category: LAB_CATEGORIES.BIOCHEMISTRY,
        sampleType: SAMPLE_TYPES.SERUM,
        sampleVolume: '3-5 ml',
        containerType: 'Plain tube (Red cap)',
        turnaroundTime: 6,
        fasting: false,
        basePrice: 500,
        urgentPrice: 750,
        patientInstructions: 'No special preparation required',
        collectionInstructions: 'Separate serum',
        parameters: [
            {
                id: 'KFT_UREA',
                name: 'Blood Urea',
                shortName: 'Urea',
                unit: 'mg/dL',
                normalRange: { general: { min: 15, max: 40 } },
                criticalHigh: 150,
                order: 1
            },
            {
                id: 'KFT_CREATININE',
                name: 'Serum Creatinine',
                shortName: 'Creatinine',
                unit: 'mg/dL',
                normalRange: {
                    male: { min: 0.7, max: 1.3 },
                    female: { min: 0.6, max: 1.1 }
                },
                criticalHigh: 10,
                order: 2
            },
            {
                id: 'KFT_URIC_ACID',
                name: 'Uric Acid',
                shortName: 'Uric Acid',
                unit: 'mg/dL',
                normalRange: {
                    male: { min: 3.4, max: 7.0 },
                    female: { min: 2.4, max: 6.0 }
                },
                order: 3
            },
            {
                id: 'KFT_BUN',
                name: 'Blood Urea Nitrogen',
                shortName: 'BUN',
                unit: 'mg/dL',
                normalRange: { general: { min: 7, max: 20 } },
                order: 4
            }
        ]
    },

    // 5. THYROID PROFILE
    {
        id: 'TEST_THYROID',
        testCode: 'THYROID',
        testName: 'Thyroid Profile',
        category: LAB_CATEGORIES.BIOCHEMISTRY,
        sampleType: SAMPLE_TYPES.SERUM,
        sampleVolume: '3-5 ml',
        containerType: 'Plain tube (Red cap)',
        turnaroundTime: 24,
        fasting: false,
        basePrice: 800,
        urgentPrice: 1200,
        patientInstructions: 'No special preparation required',
        collectionInstructions: 'Separate serum, avoid hemolysis',
        parameters: [
            {
                id: 'THYROID_T3',
                name: 'Triiodothyronine (T3)',
                shortName: 'T3',
                unit: 'ng/dL',
                normalRange: { general: { min: 80, max: 200 } },
                order: 1
            },
            {
                id: 'THYROID_T4',
                name: 'Thyroxine (T4)',
                shortName: 'T4',
                unit: 'μg/dL',
                normalRange: { general: { min: 5.0, max: 12.0 } },
                order: 2
            },
            {
                id: 'THYROID_TSH',
                name: 'Thyroid Stimulating Hormone',
                shortName: 'TSH',
                unit: 'μIU/mL',
                normalRange: { general: { min: 0.5, max: 5.0 } },
                criticalLow: 0.1,
                criticalHigh: 10.0,
                order: 3
            }
        ]
    },

    // 6. BLOOD SUGAR - FASTING
    {
        id: 'TEST_BS_FASTING',
        testCode: 'BSF',
        testName: 'Blood Sugar - Fasting',
        category: LAB_CATEGORIES.BIOCHEMISTRY,
        sampleType: SAMPLE_TYPES.PLASMA,
        sampleVolume: '2 ml',
        containerType: 'Fluoride tube (Grey cap)',
        turnaroundTime: 2,
        fasting: true,
        basePrice: 100,
        urgentPrice: 150,
        patientInstructions: '8-10 hours fasting required. Water is allowed.',
        collectionInstructions: 'Collect in fluoride tube',
        parameters: [
            {
                id: 'BSF_GLUCOSE',
                name: 'Fasting Blood Glucose',
                shortName: 'FBS',
                unit: 'mg/dL',
                normalRange: { general: { min: 70, max: 110 } },
                criticalLow: 40,
                criticalHigh: 400,
                order: 1
            }
        ]
    },

    // 7. BLOOD SUGAR - POST PRANDIAL
    {
        id: 'TEST_BS_PP',
        testCode: 'BSPP',
        testName: 'Blood Sugar - Post Prandial (PP)',
        category: LAB_CATEGORIES.BIOCHEMISTRY,
        sampleType: SAMPLE_TYPES.PLASMA,
        sampleVolume: '2 ml',
        containerType: 'Fluoride tube (Grey cap)',
        turnaroundTime: 2,
        fasting: false,
        basePrice: 100,
        urgentPrice: 150,
        patientInstructions: 'Collect 2 hours after meal/glucose load',
        collectionInstructions: 'Collect in fluoride tube',
        parameters: [
            {
                id: 'BSPP_GLUCOSE',
                name: 'Post Prandial Blood Glucose',
                shortName: 'PPBS',
                unit: 'mg/dL',
                normalRange: { general: { min: 70, max: 140 } },
                criticalLow: 40,
                criticalHigh: 400,
                order: 1
            }
        ]
    },

    // 8. HbA1c (Glycated Hemoglobin)
    {
        id: 'TEST_HBA1C',
        testCode: 'HBA1C',
        testName: 'HbA1c (Glycated Hemoglobin)',
        category: LAB_CATEGORIES.BIOCHEMISTRY,
        sampleType: SAMPLE_TYPES.BLOOD,
        sampleVolume: '2 ml',
        containerType: 'EDTA tube (Purple cap)',
        turnaroundTime: 24,
        fasting: false,
        basePrice: 500,
        urgentPrice: 700,
        patientInstructions: 'No fasting required',
        collectionInstructions: 'Collect in EDTA tube',
        parameters: [
            {
                id: 'HBA1C_VALUE',
                name: 'HbA1c',
                shortName: 'HbA1c',
                unit: '%',
                normalRange: { general: { min: 4.0, max: 5.6 } },
                criticalHigh: 10.0,
                order: 1,
                interpretation: {
                    '< 5.7': 'Normal',
                    '5.7 - 6.4': 'Prediabetes',
                    '≥ 6.5': 'Diabetes'
                }
            }
        ]
    }
];

export default LAB_TEST_TEMPLATES;
