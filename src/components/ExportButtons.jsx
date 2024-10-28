import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportICS } from '../utils/exportICS';

const ExportButtons = ({ pickedCourses }) => {

  // Function to export as PNG
  const handleExportPNG = () => {
    const scheduleElement = document.getElementById('schedule-grid');
    html2canvas(scheduleElement).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'schedule.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // Function to export as PDF
  const handleExportPDF = () => {
    const scheduleElement = document.getElementById('schedule-grid');
    html2canvas(scheduleElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10);
      pdf.save('schedule.pdf');
    });
  };

  // Function to export as ICS
  const handleExportICS = () => {
    exportICS(pickedCourses);
  };

  return (
    <div>
      <button onClick={handleExportPNG}>Export as PNG</button>
      <button onClick={handleExportPDF}>Export as PDF</button>
      <button onClick={handleExportICS}>Export as ICS</button>
    </div>
  );
};

export default ExportButtons;
