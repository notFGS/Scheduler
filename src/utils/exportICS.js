import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { generateICS } from './icsUtils';

export function exportICS(pickedCourses) {
  // Helper to convert course day to day of the week index (0 - Sunday, 6 - Saturday)
  const dayOfWeekMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  // Prepare events from picked courses
  const events = pickedCourses.flatMap((semesterCourses) => {
    return semesterCourses.map((course) => {
      const courseEvents = [];

      // Helper function to create repeating events for both day1 and day2
      const createEventForDay = (day, fromTime, toTime, location) => {
        if (!day) return null; // Skip if day is not available
        
        const startDate = new Date(course.startDate);  // Start date already in milliseconds
        const endDate = new Date(course.endDate);      // End date in milliseconds
        
        // Calculate the course start and end times
        const startTime = formatTime(fromTime);
        const endTime = formatTime(toTime);
        
        // Adjust startDate to match the course day
        const eventStartDate = adjustToNextDay(startDate, dayOfWeekMap[day]);
        
        // Construct the event with recurrence rule until the course's end date
        return {
          title: `${course.title} - ${course.field}`,
          location: location,
          description: `Course ID: ${course.id}`,
          startDateTime: `${format(eventStartDate, 'yyyyMMdd')}T${startTime}`,
          endDateTime: `${format(eventStartDate, 'yyyyMMdd')}T${endTime}`,
          recurrenceRule: `FREQ=WEEKLY;UNTIL=${format(endDate, 'yyyyMMdd')}T000000Z`,  // Weekly recurrence until course end date
        };
      };

      // Create event for the primary course day
      const primaryEvent = createEventForDay(
        course.day,
        course.fromTime,
        course.toTime,
        course.location
      );

      if (primaryEvent) courseEvents.push(primaryEvent);

      // Create event for the secondary course day, if available
      const secondaryEvent = createEventForDay(
        course.day2,
        course.fromTime2,
        course.toTime2,
        course.location2
      );

      if (secondaryEvent) courseEvents.push(secondaryEvent);

      return courseEvents;
    });
  });

  // Flatten the events array and remove empty entries
  const flattenedEvents = events.flat().filter(event => event !== null);

  // Build the ICS file
  const icsFileContent = generateICS(flattenedEvents);

  // Download the ICS file
  const blob = new Blob([icsFileContent], { type: 'text/calendar;charset=utf-8' });
  saveAs(blob, 'schedule.ics');
}

// Helper function to format the time as HHMM
function formatTime(time) {
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
}

// Adjusts the start date to the next occurrence of the specified day of the week
function adjustToNextDay(date, dayOfWeek) {
  const currentDay = date.getDay();
  const daysToAdd = (dayOfWeek + 7 - currentDay) % 7;
  return new Date(date.setDate(date.getDate() + daysToAdd));
}
