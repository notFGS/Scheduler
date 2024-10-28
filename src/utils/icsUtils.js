export function createICSEvent(course) {
    const icsEvent = `
  BEGIN:VEVENT
  SUMMARY:${course.title}
  DTSTART:${formatDate(course.startDate)}
  DTEND:${formatDate(course.endDate)}
  LOCATION:${course.location}
  DESCRIPTION:Course for ${course.field}
  END:VEVENT
    `;
  
    return icsEvent;
  }
  
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    // Format the date in the format required by ICS (YYYYMMDDTHHMMSSZ)
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  }
  
export function generateICS(pickedCourses) {
let icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//Course Schedule//EN
`;

pickedCourses.forEach(course => {
    icsContent += createICSEvent(course);
});

icsContent += `
END:VCALENDAR
`;

return icsContent;
}
  