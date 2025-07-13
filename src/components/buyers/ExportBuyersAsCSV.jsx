import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const exportBuyersAsExcel = (buyersWithStats) => {
  const header = ['Name','National ID', 'Email', 'Phone', 'City', 'Properties', 'Total Paid', 'Outstanding', 'Status'];

  const data = buyersWithStats.map(buyer => [
    `${buyer.firstName} ${buyer.lastName}`,
    buyer.email,
    buyer.nationalId || 'N/A',
    buyer.phoneNumber,
    buyer.city,
    buyer.stats?.properties || 0,
    buyer.stats?.totalPaid || 0,
    buyer.stats?.outstanding || 0,
    buyer.stats?.outstanding > 0 ? 'Outstanding' : 'Current'
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);

  // 🔧 Prevent text wrapping
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];
      if (cell) {
        cell.s = {
          alignment: { wrapText: false }
        };
      }
    }
  }

  // 📐 Optional: auto column width
  worksheet['!cols'] = header.map(() => ({ wch: 20 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Buyers');

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
    cellStyles: true
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/octet-stream'
  });

  saveAs(blob, 'buyers.xlsx');
};

export default exportBuyersAsExcel;
