import { InspectionTemplate } from '../types';

export const PREDEFINED_TEMPLATES: InspectionTemplate[] = [
  {
    id: 'tmpl_fuel_dispenser',
    name: 'Fuel Dispensing Unit (Petrol/Diesel/CNG)',
    businessType: 'Fuel Station & Energy Retail',
    apparatusType: 'Multi-Nozzle Fuel Dispenser (MPD)',
    accuracyClass: 'Class III',
    description: 'Statutory verification checklist & volume accuracy delivery tolerance tests for retail petroleum dispensing units.',
    icon: 'local_gas_station',
    color: '#000666',
    applicableLaw: 'Legal Metrology (General) Rules 2011 - Part VI (Measuring Systems for Liquids)',
    createdAt: '2026-01-10',
    isPredefined: true,
    authorBadge: 'HQ-STATUTORY',
    usageCount: 148,
    defaultNotes: 'All dispensing nozzles verified with 5L and 20L standard conical capacity measures. Anti-tamper pulsar electronic seals locked.',
    checklists: [
      { id: 'c_fuel_1', category: 'Physical & Safety', label: 'Explosion-proof flameproof electrical enclosure & earthing resistance < 5Ω', completed: false },
      { id: 'c_fuel_2', category: 'Physical & Safety', label: 'Emergency break-away coupling & anti-spill auto-shutoff nozzle verified', completed: false },
      { id: 'c_fuel_3', category: 'Security & Seals', label: 'Anti-tamper pulsar gear lead & wire seal intact with current quarter stamp', completed: false },
      { id: 'c_fuel_4', category: 'Security & Seals', label: 'Microprocessor calibration switch locked with physical inspector seal', completed: false },
      { id: 'c_fuel_5', category: 'Display & Metering', label: 'Price-to-volume electronic computing display synchronized with zero reset', completed: false },
      { id: 'c_fuel_6', category: 'Display & Metering', label: 'Mechanical non-resettable totalizer reading recorded in statutory logbook', completed: false },
      { id: 'c_fuel_7', category: 'Compliance', label: 'Valid calibration certificate for officer 5L & 20L conical test measures', completed: false },
      { id: 'c_fuel_8', category: 'Compliance', label: 'Mandatory consumer declaration notice displayed regarding 5L test measure', completed: false },
    ],
    readings: [
      {
        id: 'r_fuel_1',
        name: '5-Litre Standard Delivery Test (Low Flow)',
        referenceWeight: 5.000,
        maxPermissibleError: 0.025,
        unit: 'L',
        isRequired: true,
      },
      {
        id: 'r_fuel_2',
        name: '5-Litre Standard Delivery Test (Full Flow)',
        referenceWeight: 5.000,
        maxPermissibleError: 0.025,
        unit: 'L',
        isRequired: true,
      },
      {
        id: 'r_fuel_3',
        name: '20-Litre Standard Delivery Test (Full Flow)',
        referenceWeight: 20.000,
        maxPermissibleError: 0.100,
        unit: 'L',
        isRequired: true,
      },
      {
        id: 'r_fuel_4',
        name: '20-Litre High Speed Continuous Flow Test',
        referenceWeight: 20.000,
        maxPermissibleError: 0.100,
        unit: 'L',
        isRequired: false,
      },
    ],
  },
  {
    id: 'tmpl_retail_scale',
    name: 'Commercial Retail Counter Scale (up to 30kg)',
    businessType: 'Retail Grocery & Supermarkets',
    apparatusType: 'Electronic Price Computing Scale',
    accuracyClass: 'Class III',
    description: 'Standard load tolerance and 4-corner eccentric balance checklist for supermarkets, meat shops, and grocery stores.',
    icon: 'storefront',
    color: '#1a237e',
    applicableLaw: 'Legal Metrology (Enforcement) Rules - Non-Automatic Weighing Instruments',
    createdAt: '2026-01-15',
    isPredefined: true,
    authorBadge: 'HQ-STATUTORY',
    usageCount: 312,
    defaultNotes: 'Zero tracking and corner tests passed within Class III tolerance threshold. Dual display clear for consumer viewing.',
    checklists: [
      { id: 'c_ret_1', category: 'Physical Alignment', label: 'Spirit bubble level centered and all 4 adjustable feet firmly locked', completed: false },
      { id: 'c_ret_2', category: 'Physical Alignment', label: 'Weighing platter clean, free from magnetic objects or debris accumulation', completed: false },
      { id: 'c_ret_3', category: 'Display & Operation', label: 'Customer-facing duplicate display clear, illuminated, and unobstructed', completed: false },
      { id: 'c_ret_4', category: 'Display & Operation', label: 'Zero-setting and automatic zero-tracking device functioning within ±0.25 e', completed: false },
      { id: 'c_ret_5', category: 'Display & Operation', label: 'Tare subtraction mechanism accurately clears platter container weight', completed: false },
      { id: 'c_ret_6', category: 'Security & Seals', label: 'Model approval number plate riveted and lead verification seal intact', completed: false },
      { id: 'c_ret_7', category: 'Security & Seals', label: 'Calibration potentiometer / jumper inaccessible without breaking seal', completed: false },
      { id: 'c_ret_8', category: 'Compliance', label: 'Trader valid registration license certificate prominently displayed', completed: false },
    ],
    readings: [
      {
        id: 'r_ret_1',
        name: '1.0 kg Standard Test Weight',
        referenceWeight: 1.000,
        maxPermissibleError: 0.002,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_ret_2',
        name: '5.0 kg Center Pan Verification',
        referenceWeight: 5.000,
        maxPermissibleError: 0.005,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_ret_3',
        name: '15.0 kg Half-Capacity Load Test',
        referenceWeight: 15.000,
        maxPermissibleError: 0.010,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_ret_4',
        name: '30.0 kg Max Capacity Span Test',
        referenceWeight: 30.000,
        maxPermissibleError: 0.015,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_ret_5',
        name: '5.0 kg Eccentric Corner Shift Test',
        referenceWeight: 5.000,
        maxPermissibleError: 0.005,
        unit: 'kg',
        isRequired: true,
      },
    ],
  },
  {
    id: 'tmpl_weighbridge',
    name: 'Heavy Industrial Weighbridge (50T - 100T)',
    businessType: 'Industrial Freight & Logistics',
    apparatusType: 'Electronic Pitless / Pit Weighbridge',
    accuracyClass: 'Class III',
    description: 'Comprehensive civil foundation, load cell junction box, multi-point corner balance, and high-tonnage proof load protocol.',
    icon: 'local_shipping',
    color: '#004d40',
    applicableLaw: 'Legal Metrology Rules - Heavy Capacity Weighing Instruments',
    createdAt: '2026-02-01',
    isPredefined: true,
    authorBadge: 'HQ-STATUTORY',
    usageCount: 89,
    defaultNotes: 'Structural clearance verified; all multi-load cell corner tests balanced within statutory limits.',
    checklists: [
      { id: 'c_wb_1', category: 'Foundation & Structure', label: 'Concrete pit / deck plate foundation free of debris, waterlogging, or warping', completed: false },
      { id: 'c_wb_2', category: 'Foundation & Structure', label: 'Longitudinal and transverse bumper stops set with 3-5mm gap clearance', completed: false },
      { id: 'c_wb_3', category: 'Civil & Approach', label: 'Smooth straight vehicle approach ramps of minimum 15-meter length', completed: false },
      { id: 'c_wb_4', category: 'Electrical & Load Cells', label: 'Hermetically sealed stainless steel load cells and junction box watertight (IP68)', completed: false },
      { id: 'c_wb_5', category: 'Electrical & Load Cells', label: 'Surge protection and dedicated earthing pit resistance below 3.0 Ohms', completed: false },
      { id: 'c_wb_6', category: 'Terminal & Security', label: 'Digital weight indicator terminal locked with unbroken verification lead seal', completed: false },
      { id: 'c_wb_7', category: 'Terminal & Security', label: 'Software weight audit trail counter recorded and verified against previous stamp', completed: false },
      { id: 'c_wb_8', category: 'Compliance', label: 'Automated weighbridge ticket printer prints Gross, Tare, Net with timestamp', completed: false },
    ],
    readings: [
      {
        id: 'r_wb_1',
        name: '10,000 kg Standard Test Mass Block',
        referenceWeight: 10000,
        maxPermissibleError: 10,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_wb_2',
        name: '20,000 kg Center Deck Load Test',
        referenceWeight: 20000,
        maxPermissibleError: 20,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_wb_3',
        name: '40,000 kg Intermediate Span Test',
        referenceWeight: 40000,
        maxPermissibleError: 40,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_wb_4',
        name: '60,000 kg Heavy Vehicle Proof Load Test',
        referenceWeight: 60000,
        maxPermissibleError: 60,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_wb_5',
        name: '10,000 kg Corner Balance (Front Left)',
        referenceWeight: 10000,
        maxPermissibleError: 10,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_wb_6',
        name: '10,000 kg Corner Balance (Rear Right)',
        referenceWeight: 10000,
        maxPermissibleError: 10,
        unit: 'kg',
        isRequired: true,
      },
    ],
  },
  {
    id: 'tmpl_jewellery_precision',
    name: 'Goldsmith & Jewellery Precision Balance',
    businessType: 'Jewellers & Precious Metals',
    apparatusType: 'High Precision Class II Analytical Balance',
    accuracyClass: 'Class II',
    description: 'Ultra-precision environmental draft shield, vibration marble slab, and milligram calibration tests for gold & bullion merchants.',
    icon: 'diamond',
    color: '#b78103',
    applicableLaw: 'Legal Metrology Rules - High Accuracy Class II Balances',
    createdAt: '2026-02-12',
    isPredefined: true,
    authorBadge: 'HQ-STATUTORY',
    usageCount: 164,
    defaultNotes: 'F1-class standard weights used. Glass draft shield verified; scale calibrated for 0.01g precision.',
    checklists: [
      { id: 'c_jewel_1', category: 'Environment & Setup', label: 'Glass draft shield intact, airtight, and free from thermal air drafts', completed: false },
      { id: 'c_jewel_2', category: 'Environment & Setup', label: 'Heavy anti-vibration marble isolation slab mounted on rigid foundation', completed: false },
      { id: 'c_jewel_3', category: 'Environment & Setup', label: 'No electrostatic charges, strong magnets, or air conditioner blowers nearby', completed: false },
      { id: 'c_jewel_4', category: 'Technical Accuracy', label: 'Display readability d = 0.001g and verification interval e = 0.01g', completed: false },
      { id: 'c_jewel_5', category: 'Technical Accuracy', label: 'Automatic motorized internal calibration routine executing properly', completed: false },
      { id: 'c_jewel_6', category: 'Security & Seals', label: 'Government verification stamp embossed on identification nameplate', completed: false },
      { id: 'c_jewel_7', category: 'Compliance', label: 'BIS Hallmarking registration and purity declaration displayed on premises', completed: false },
    ],
    readings: [
      {
        id: 'r_jewel_1',
        name: '10.00 g F1 Class Standard Weight',
        referenceWeight: 0.010,
        maxPermissibleError: 0.00002,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_jewel_2',
        name: '50.00 g Center Pan Precision Test',
        referenceWeight: 0.050,
        maxPermissibleError: 0.00005,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_jewel_3',
        name: '200.00 g Intermediate Verification Test',
        referenceWeight: 0.200,
        maxPermissibleError: 0.00010,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_jewel_4',
        name: '1000.00 g (1 kg) Full Scale Capacity Test',
        referenceWeight: 1.000,
        maxPermissibleError: 0.00020,
        unit: 'kg',
        isRequired: true,
      },
    ],
  },
  {
    id: 'tmpl_apmc_grain_scale',
    name: 'APMC Grain Mandi Heavy Platform Scale',
    businessType: 'Agriculture & Grain Markets',
    apparatusType: 'Bagging Platform Scale & Moisture Analyzer',
    accuracyClass: 'Class III',
    description: 'Verification protocol for agricultural wholesale markets, bagging platform scales, and farmer grain moisture analyzers.',
    icon: 'agriculture',
    color: '#2e7d32',
    applicableLaw: 'Legal Metrology (APMC Mandi Regulation) Special Rules',
    createdAt: '2026-02-18',
    isPredefined: true,
    authorBadge: 'HQ-STATUTORY',
    usageCount: 204,
    defaultNotes: 'Burlap bag standard tare deduction confirmed at 1.0 kg; farmer grievance display verified.',
    checklists: [
      { id: 'c_apmc_1', category: 'Platform & Structure', label: 'Cast iron platform surface level, clean, and free of spilled grain buildup', completed: false },
      { id: 'c_apmc_2', category: 'Platform & Structure', label: 'Protective rubber dust bellows around load sensor intact', completed: false },
      { id: 'c_apmc_3', category: 'Farmer Transparency', label: 'Standard burlap bag tare weight fixed and posted clearly (1.0 kg)', completed: false },
      { id: 'c_apmc_4', category: 'Farmer Transparency', label: 'Large overhead LED weight display visible to farmer from 20 meters', completed: false },
      { id: 'c_apmc_5', category: 'Moisture Testing', label: 'Digital grain moisture analyzer temperature compensation sensor verified', completed: false },
      { id: 'c_apmc_6', category: 'Security & Seals', label: 'Lead verification seal embossed with official Mandi Inspector code', completed: false },
    ],
    readings: [
      {
        id: 'r_apmc_1',
        name: '20.0 kg Standard Test Weight',
        referenceWeight: 20.000,
        maxPermissibleError: 0.020,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_apmc_2',
        name: '50.0 kg (1 Standard Bag Load)',
        referenceWeight: 50.000,
        maxPermissibleError: 0.050,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_apmc_3',
        name: '100.0 kg Half-Capacity Platform Test',
        referenceWeight: 100.000,
        maxPermissibleError: 0.050,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_apmc_4',
        name: '200.0 kg Full Capacity Proof Test',
        referenceWeight: 200.000,
        maxPermissibleError: 0.100,
        unit: 'kg',
        isRequired: true,
      },
    ],
  },
  {
    id: 'tmpl_fmcg_packaged_goods',
    name: 'Pre-Packaged Commodities Checkweigher',
    businessType: 'FMCG & Food Processing Units',
    apparatusType: 'Dynamic In-Line Checkweigher',
    accuracyClass: 'Class III',
    description: 'Compliance verification under Legal Metrology Packaged Commodities (LMPC) Rules for consumer packaged goods & batch weights.',
    icon: 'inventory_2',
    color: '#d84315',
    applicableLaw: 'Legal Metrology (Packaged Commodities) Rules 2011',
    createdAt: '2026-03-01',
    isPredefined: true,
    authorBadge: 'HQ-STATUTORY',
    usageCount: 76,
    defaultNotes: 'LMPC mandatory declarations verified on packaging samples. Underweight reject arm timing validated.',
    checklists: [
      { id: 'c_fmcg_1', category: 'LMPC Declarations', label: 'Manufacturer name, address, country of origin clearly declared on packaging', completed: false },
      { id: 'c_fmcg_2', category: 'LMPC Declarations', label: 'Net quantity declaration in standard SI units (g, kg, ml, L) without misleading font size', completed: false },
      { id: 'c_fmcg_3', category: 'LMPC Declarations', label: 'MRP inclusive of all taxes, manufacturing date, and customer care email/phone listed', completed: false },
      { id: 'c_fmcg_4', category: 'Checkweigher Operation', label: 'Conveyor belt speed synchronized and high-speed pneumatic reject arm operational', completed: false },
      { id: 'c_fmcg_5', category: 'Checkweigher Operation', label: 'Statistical batch average net weight meets or exceeds declared nominal quantity', completed: false },
      { id: 'c_fmcg_6', category: 'Security & Seals', label: 'Dynamic calibration software configuration password-protected and logged', completed: false },
    ],
    readings: [
      {
        id: 'r_fmcg_1',
        name: '250 g Nominal Package Sample Test',
        referenceWeight: 0.250,
        maxPermissibleError: 0.003,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_fmcg_2',
        name: '500 g Nominal Package Sample Test',
        referenceWeight: 0.500,
        maxPermissibleError: 0.005,
        unit: 'kg',
        isRequired: true,
      },
      {
        id: 'r_fmcg_3',
        name: '1000 g (1 kg) Master Standard Test',
        referenceWeight: 1.000,
        maxPermissibleError: 0.005,
        unit: 'kg',
        isRequired: true,
      },
    ],
  },
];

const TEMPLATES_STORAGE_KEY = 'mapansetu_custom_templates_v1';

export function loadSavedTemplates(): InspectionTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return PREDEFINED_TEMPLATES;
    const custom: InspectionTemplate[] = JSON.parse(raw);
    return [...PREDEFINED_TEMPLATES, ...custom];
  } catch {
    return PREDEFINED_TEMPLATES;
  }
}

export function saveCustomTemplate(template: InspectionTemplate): InspectionTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const existingCustom: InspectionTemplate[] = raw ? JSON.parse(raw) : [];
    
    // Check if updating existing custom
    const index = existingCustom.findIndex(t => t.id === template.id);
    let updatedCustom: InspectionTemplate[];
    if (index >= 0) {
      updatedCustom = [...existingCustom];
      updatedCustom[index] = template;
    } else {
      updatedCustom = [template, ...existingCustom];
    }
    
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedCustom));
    return [...PREDEFINED_TEMPLATES, ...updatedCustom];
  } catch {
    return PREDEFINED_TEMPLATES;
  }
}

export function deleteCustomTemplate(templateId: string): InspectionTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const existingCustom: InspectionTemplate[] = raw ? JSON.parse(raw) : [];
    const updatedCustom = existingCustom.filter(t => t.id !== templateId);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedCustom));
    return [...PREDEFINED_TEMPLATES, ...updatedCustom];
  } catch {
    return PREDEFINED_TEMPLATES;
  }
}
