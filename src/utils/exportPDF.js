import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const exportPDF = () => {
  const schedule = document.getElementById('schedule-grid');  // Assuming your grid has this ID

  html2canvas(schedule).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Calculate dimensions to fit the image into A4
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const heightLeft = imgHeight;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('schedule.pdf');
  });
};

export default exportPDF;
