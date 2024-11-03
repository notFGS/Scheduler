const ics = require('ics');
const { saveAs } = require('file-saver');

function exportToICS(courses, fileName) {
  const events = courses.flatMap(course => {
    return course.schedule.map(scheduleItem => {
      const [startHour, startMinute] = scheduleItem.fromTime.split(':').map(Number);
      const [endHour, endMinute] = scheduleItem.toTime.split(':').map(Number);
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1; // Months are zero-based
      const startDay = startDate.getDate();
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;
      const endDay = endDate.getDate();

      return {
        title: course.name,
        start: [startYear, startMonth, startDay, startHour, startMinute],
        end: [startYear, startMonth, startDay, endHour, endMinute],
        recurrenceRule: `FREQ=WEEKLY;BYDAY=${scheduleItem.day};UNTIL=${endYear}${endMonth}${endDay}T235959Z`
      };
    });
  });

  ics.createEvents(events, (error, value) => {
    if (error) {
      console.error(error);
      return;
    }
    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, fileName);
  });
}

module.exports = {
  exportToICS
};
