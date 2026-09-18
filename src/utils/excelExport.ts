import * as XLSX from 'xlsx';
import { Project } from '../types';

export function exportProjectsToExcel(projects: Project[]) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: Project List
  const listData = projects.map(p => ({
    'ID Project': p.id,
    'Nama Project': p.name,
    'Area': p.area || 'Jabo 1',
    'Tanggal Surat Dinas': p.tanggalSuratDinas || '-',
    'Nomor Surat Dinas': p.nomorSuratDinas || '-',
    'Status Pipeline': p.status,
    'Remarks (Catatan)': p.remarks || '-',
    'Dibuat Pada': p.createdAt || '-',
    'Terakhir Diupdate': p.updatedAt || '-',
  }));
  const ws1 = XLSX.utils.json_to_sheet(listData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Project List');

  // 2. Sheet 2: Progress Construction
  const constData = projects.map(p => {
    const totalFO = Object.values(p.construction.pullingFO).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const totalHH = Object.values(p.construction.hh).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const totalHB = Object.values(p.construction.hb).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const totalMH = Object.values(p.construction.mh).reduce((acc, val) => acc + (Number(val) || 0), 0);

    return {
      'ID Project': p.id,
      'Nama Project': p.name,
      'Area': p.area || 'Jabo 1',
      'Status': p.status,
      'Boring Alur (m)': p.construction.boring.alur || '0',
      'Boring Jalan/Tol (m)': p.construction.boring.jalan || '0',
      'Boring Akses (m)': p.construction.boring.akses || '0',
      'Boring Jembatan ATB (m)': p.construction.boring.jembatan || '0',
      'Boring Sungai/Kali (m)': p.construction.boring.sungai || '0',
      'Total FO Pulled (m)': totalFO,
      'FO 288 GL (m)': p.construction.pullingFO['288 GL'] || 0,
      'FO 288 (m)': p.construction.pullingFO['288'] || 0,
      'FO 144 GL (m)': p.construction.pullingFO['144 GL'] || 0,
      'FO 144 (m)': p.construction.pullingFO['144'] || 0,
      'FO 96 GL (m)': p.construction.pullingFO['96 GL'] || 0,
      'FO 96 (m)': p.construction.pullingFO['96'] || 0,
      'FO 48 (m)': p.construction.pullingFO['48'] || 0,
      'FO 24 (m)': p.construction.pullingFO['24'] || 0,
      'FO 12 (m)': p.construction.pullingFO['12'] || 0,
      'Kabel Coax (m)': p.construction.pullingCoax || 0,
      'Total Handhole (HH)': totalHH,
      'Total HB': totalHB,
      'Total Manhole (MH)': totalMH,
      'Galvanis 2" (m)': p.construction.galvanis['2'] || 0,
      'Galvanis 4" (m)': p.construction.galvanis['4'] || 0,
    };
  });
  const ws2 = XLSX.utils.json_to_sheet(constData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Progress Construction');

  // 3. Sheet 3: Laporan PMO
  const pmoData = projects.map(p => ({
    'ID Project': p.id,
    'Nama Project': p.name,
    'Area': p.area || 'Jabo 1',
    'Tanggal Surat Dinas': p.tanggalSuratDinas || '-',
    'Nomor Surat Dinas': p.nomorSuratDinas || '-',
    'Status': p.status,
    'As Plan Request': p.pmo.asPlan.request || '-',
    'As Plan Release': p.pmo.asPlan.release || '-',
    'Nomor MR': p.pmo.asPlan.mr || '-',
    'Project ID': p.pmo.asPlan.projectId || '-',
    'Tanggal Survey': p.pmo.survey || '-',
    'CW Start': p.pmo.civilWork.start || '-',
    'CW End': p.pmo.civilWork.end || '-',
    'CW Deadline': p.pmo.civilWork.deadline || '-',
    'Pulling Mat. On Site': p.pmo.pulling.matOnSite || '-',
    'Pulling Start': p.pmo.pulling.start || '-',
    'Pulling End': p.pmo.pulling.end || '-',
    'Material Date': p.pmo.material.date || '-',
    'Material Submit': p.pmo.material.submit ? 'Yes' : 'No',
    'Material Review': p.pmo.material.review ? 'Yes' : 'No',
    'Material Approval': p.pmo.material.approval ? 'Yes' : 'No',
    'Release MR Mat': p.pmo.material.releaseMR || '-',
    'Labour Date': p.pmo.labour.date || '-',
    'Labour Submit': p.pmo.labour.submit ? 'Yes' : 'No',
    'Labour Review': p.pmo.labour.review ? 'Yes' : 'No',
    'Labour Approval': p.pmo.labour.approval ? 'Yes' : 'No',
    'Release MR Labour': p.pmo.labour.releaseMR || '-',
    'RCF Request': p.pmo.rcf.request || '-',
    'RCF Release': p.pmo.rcf.release || '-',
    'Cut Over Date': p.pmo.cutOver.date || '-',
    'Cut Over Phase': p.pmo.cutOver.phase || '-',
    'Doc Closing Start': p.pmo.closing.docStart || '-',
    'Doc Closing End': p.pmo.closing.docEnd || '-',
    'TECO SAP Start': p.pmo.closing.tecoStart || '-',
    'TECO SAP End': p.pmo.closing.tecoEnd || '-',
  }));
  const ws3 = XLSX.utils.json_to_sheet(pmoData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Laporan PMO');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Laporan_PMO_Project_Hub_${today}.xlsx`);
}
