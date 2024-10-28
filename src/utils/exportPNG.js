import html2canvas from 'html2canvas';

const exportPNG = () => {
  const schedule = document.getElementById('schedule-grid');  // Assuming your grid has this ID

  html2canvas(schedule).then(canvas => {
    const link = document.createElement('a');
    link.download = 'schedule.png';
    link.href = canvas.toDataURL();
    link.click();
  });
};

export default exportPNG;
