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

export function parseICS(icsContent) {
  const events = [];
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;

  while ((match = eventRegex.exec(icsContent)) !== null) {
    const eventText = match[1];
    const event = {};

    eventText.split('\n').forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        event[key.trim()] = value.trim();
      }
    });

    events.push(event);
  }

  return events;
}
  