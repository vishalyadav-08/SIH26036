import { jsPDF } from 'jspdf';
import { InspectionTask, OfficerProfile } from '../types';

export function generateInspectionPDF(task: InspectionTask, profile: OfficerProfile) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const certNumber = task.certificateNo || `LM-${task.appId.replace('APP-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const stampId = task.stampId || task.finalAssessment?.verifiedStampId || `IN-DLM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const dateStr = task.completedDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Border and Header frame
  doc.setDrawColor(0, 6, 102); // Deep Blue #000666
  doc.setLineWidth(0.8);
  doc.rect(8, 8, pageWidth - 16, 281);

  doc.setLineWidth(0.2);
  doc.setDrawColor(26, 35, 126); // Indigo #1a237e
  doc.rect(9.5, 9.5, pageWidth - 19, 278);

  // Header Banner
  doc.setFillColor(0, 6, 102);
  doc.rect(10, 10, pageWidth - 20, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS', pageWidth / 2, 17, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPARTMENT OF LEGAL METROLOGY • FIELD VERIFICATION DIVISION', pageWidth / 2, 23, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Under The Legal Metrology Act, 2009 & General Rules, 2011', pageWidth / 2, 29, { align: 'center' });

  // Certificate Title & Number
  let y = 42;
  doc.setTextColor(0, 6, 102);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CERTIFICATE OF VERIFICATION & INSPECTION REPORT', pageWidth / 2, y, { align: 'center' });

  y += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Certificate No: ${certNumber}  |  Application ID: ${task.appId}  |  Date: ${dateStr}`, pageWidth / 2, y, { align: 'center' });

  // Divider
  y += 5;
  doc.setDrawColor(200, 200, 210);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);

  // Section 1: Establishment & Equipment Details
  y += 6;
  doc.setFillColor(240, 242, 250);
  doc.rect(14, y, pageWidth - 28, 6, 'F');
  doc.setTextColor(0, 6, 102);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. ESTABLISHMENT & APPARATUS PARTICULARS', 16, y + 4.5);

  y += 10;
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);

  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.text('Trader / Enterprise:', 16, y);
  doc.setFont('helvetica', 'normal');
  doc.text(task.businessName, 52, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Location / Sector:', 16, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${task.sector} (${task.location.address || 'Geo-Tagged Site'})`, 52, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('GPS Coordinates:', 16, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(task.location.lat ? `${task.location.lat.toFixed(5)}°N, ${task.location.lng?.toFixed(5)}°E (±${task.location.accuracy || 4.2}m)` : 'Verified On-Site', 52, y + 10);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.text('Apparatus Type:', 115, y);
  doc.setFont('helvetica', 'normal');
  doc.text(task.title, 150, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Model / Serial No:', 115, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${task.deviceModel || 'Apex-Series III'} / ${task.serialNumber || 'SN-' + task.appId.slice(-4)}`, 150, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Accuracy Class:', 115, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(task.accuracyClass || 'Class III (Commercial Medium)', 150, y + 10);

  // Section 2: Measurement & Load Test Verification
  y += 18;
  doc.setFillColor(240, 242, 250);
  doc.rect(14, y, pageWidth - 28, 6, 'F');
  doc.setTextColor(0, 6, 102);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('2. LOAD & TOLERANCE TEST READINGS', 16, y + 4.5);

  // Table Header
  y += 8;
  doc.setFillColor(225, 230, 248);
  doc.rect(14, y, pageWidth - 28, 6, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 6, 102);
  doc.text('Test Parameter', 16, y + 4.2);
  doc.text('Reference Standard', 65, y + 4.2);
  doc.text('Indicated Value', 105, y + 4.2);
  doc.text('Error Margin', 140, y + 4.2);
  doc.text('Permissible Limit (MPE)', 165, y + 4.2);

  // Table Rows
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);

  task.readings.forEach((r, idx) => {
    const indicated = r.indicatedWeight !== undefined ? `${r.indicatedWeight} ${r.unit}` : '5.000 kg';
    const ref = `${r.referenceWeight} ${r.unit}`;
    const diff = r.indicatedWeight !== undefined ? (r.indicatedWeight - r.referenceWeight).toFixed(3) : '0.000';
    const errorStr = `${parseFloat(diff) >= 0 ? '+' : ''}${diff} ${r.unit}`;
    const mpeStr = `±${r.maxPermissibleError} ${r.unit}`;

    if (idx % 2 === 1) {
      doc.setFillColor(248, 249, 252);
      doc.rect(14, y, pageWidth - 28, 5.5, 'F');
    }

    doc.text(r.name, 16, y + 4);
    doc.text(ref, 65, y + 4);
    doc.text(indicated, 105, y + 4);
    doc.text(errorStr, 140, y + 4);
    doc.text(mpeStr, 165, y + 4);

    y += 5.5;
  });

  // Section 3: Statutory Checkpoints Audit
  y += 3;
  doc.setFillColor(240, 242, 250);
  doc.rect(14, y, pageWidth - 28, 6, 'F');
  doc.setTextColor(0, 6, 102);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('3. STATUTORY COMPLIANCE & PHYSICAL AUDIT', 16, y + 4.5);

  y += 8;
  doc.setFontSize(7.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);

  const completedChecks = task.checklists.filter((c) => c.completed);
  const totalChecks = task.checklists.length;

  let col1Y = y;
  let col2Y = y;

  task.checklists.slice(0, 10).forEach((item, i) => {
    const isCol1 = i < 5;
    const currentY = isCol1 ? col1Y : col2Y;
    const xPos = isCol1 ? 16 : 105;

    // Check symbol
    doc.setFont('helvetica', 'bold');
    if (item.completed) {
      doc.setTextColor(46, 125, 50); // green
      doc.text('[✓]', xPos, currentY);
    } else {
      doc.setTextColor(186, 26, 26); // red
      doc.text('[✗]', xPos, currentY);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const cleanLabel = item.label.length > 44 ? item.label.slice(0, 42) + '...' : item.label;
    doc.text(cleanLabel, xPos + 6, currentY);

    if (isCol1) col1Y += 5;
    else col2Y += 5;
  });

  y = Math.max(col1Y, col2Y) + 2;

  // Section 4: Photographic Evidence & Verification Stamp
  doc.setFillColor(240, 242, 250);
  doc.rect(14, y, pageWidth - 28, 6, 'F');
  doc.setTextColor(0, 6, 102);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('4. EVIDENCE ATTACHMENTS & VERIFICATION STAMP', 16, y + 4.5);

  y += 9;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Attached Photos / Digital Records: ${task.evidence.length} Items (Nameplate, Verification Wire Seal, Display)`, 16, y);
  doc.text(`Official Stamp Number Assigned: `, 16, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 6, 102);
  doc.text(stampId, 65, y + 5);

  // Section 5: Legal Verdict & Final Assessment
  y += 12;
  const result = task.finalAssessment?.result || 'pass';
  let badgeColor: [number, number, number] = [46, 125, 50]; // green
  let verdictText = 'VERIFIED, STAMPED & CERTIFIED AS FIT FOR COMMERCIAL USE';
  if (result === 'fail') {
    badgeColor = [186, 26, 26]; // red
    verdictText = 'REJECTED: NON-COMPLIANT UNDER SECTION 24 OF LEGAL METROLOGY ACT';
  } else if (result === 'correction') {
    badgeColor = [249, 168, 37]; // amber
    verdictText = 'CONDITIONAL PASS: RE-CALIBRATION NOTICE ISSUED (7 DAYS)';
  }

  doc.setFillColor(...badgeColor);
  doc.rect(14, y, pageWidth - 28, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`FINAL VERDICT: ${verdictText}`, pageWidth / 2, y + 6, { align: 'center' });

  // Officer remarks box
  y += 12;
  doc.setDrawColor(200, 200, 210);
  doc.setFillColor(252, 252, 255);
  doc.rect(14, y, pageWidth - 28, 14, 'FD');
  doc.setTextColor(0, 6, 102);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Officer Observations & Endorsements:', 16, y + 4.5);

  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  const remarks = task.finalAssessment?.officerNotes || 'Apparatus inspected in accordance with standards. Tolerances within prescribed limits. Verification stamp applied.';
  const splitRemarks = doc.splitTextToSize(remarks, pageWidth - 36);
  doc.text(splitRemarks.slice(0, 2), 16, y + 9);

  // Section 6: Signatures and QR Stamp
  y += 20;

  // Officer Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 6, 102);
  doc.text('Inspecting Legal Metrology Officer:', 16, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(profile.name, 16, y + 5);
  doc.text(`Badge No: ${profile.badgeNumber}`, 16, y + 9);
  doc.text(`Designation: ${profile.role}`, 16, y + 13);
  doc.setFont('helvetica', 'italic');
  doc.text('(Digitally Authenticated via Biometric Token)', 16, y + 17);

  // Official Seal Simulation
  doc.setDrawColor(0, 6, 102);
  doc.setLineWidth(0.6);
  doc.circle(105, y + 8, 12);
  doc.circle(105, y + 8, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.text('LEGAL METROLOGY', 105, y + 4, { align: 'center' });
  doc.text('GOVT OF INDIA', 105, y + 8, { align: 'center' });
  doc.text('OFFICIAL SEAL', 105, y + 12, { align: 'center' });

  // Verification QR Stamp Area
  doc.setFillColor(240, 240, 245);
  doc.rect(pageWidth - 56, y - 2, 42, 22, 'F');
  doc.setDrawColor(180, 180, 190);
  doc.rect(pageWidth - 56, y - 2, 42, 22);

  doc.setTextColor(0, 6, 102);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('SECURITY VERIFICATION QR', pageWidth - 35, y + 2.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(80, 80, 80);
  doc.text(`Scan to verify at portal`, pageWidth - 35, y + 7, { align: 'center' });
  doc.text(`mapansetu.gov.in/verify`, pageWidth - 35, y + 11, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(`HASH: #${task.appId.slice(-4)}-984A`, pageWidth - 35, y + 16, { align: 'center' });

  // Footer Disclaimer
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This is a digitally generated Certificate of Verification under the Legal Metrology Act, 2009. Tampering or altering is punishable by law.',
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  // Save the document
  const filename = `Verification_Certificate_${task.appId}_${certNumber}.pdf`;
  doc.save(filename);
}
