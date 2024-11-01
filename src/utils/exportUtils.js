import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { parseICS, generateICS } from './icsUtils';

export async function exportToPng(elementId, fileName) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Element not found');
    }
    const canvas = await html2canvas(element);
    canvas.toBlob(blob => {
        saveAs(blob, `${fileName}.png`);
    });
}

export function exportToPdf(elementId, fileName) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Element not found');
    }
    html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 0, 0);
        pdf.save(`${fileName}.pdf`);
    });
}

export function exportToIcs(eventDetails, fileName) {
    const { error, value } = generateICS(eventDetails);
    if (error) {
        throw new Error(error);
    }
    const blob = new Blob([value], { type: 'text/calendar' });
    saveAs(blob, `${fileName}.ics`);
}

export function loadIcsFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const icsData = event.target.result;
        const parsedData = parseICS(icsData);
        callback(parsedData);
    };
    reader.readAsText(file);
}