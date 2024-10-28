import React from 'react';
import './Schedule.css';

// Helper function to format time in HH:MM format
const formatTime = (time) => {
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Helper function to convert time (e.g., 1430) to fractional hours (e.g., 14.5)
const convertToFractionalHour = (time) => {
  const hour = Math.floor(time / 100);
  const minutes = time % 100;
  return hour + minutes / 60;
};

// Function to calculate the grid position based on time and day (15-minute intervals)
const calculateGridPosition = (course, minHour, isSecondary = false) => {
  const startHour = convertToFractionalHour(isSecondary ? course.fromTime2 : course.fromTime);
  const endHour = convertToFractionalHour(isSecondary ? course.toTime2 : course.toTime);

  // Multiply by 4 because each hour has 4 blocks (15-minute increments)
  // Subtract 1 from startRow to adjust the position backwards by 15 minutes
  const startRow = Math.floor((startHour - minHour) * 4) + 1; // Shift by -00:15 for the start
  const endRow = Math.floor((endHour - minHour) * 4) + 1; // Adjust by -00:15 to prevent extending block by 15 minutes

  // Correct calculation for day column
  const dayColumn = days.indexOf(isSecondary ? course.day2 : course.day) + 1; // Day columns should start from 1 (Sunday)

  return { startRow, endRow, dayColumn };
};

// Fixed days of the week (Sunday to Thursday)
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

// Fixed time slots for the time index (only show hours like 09:00, 10:00, etc.)
const fixedTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00'
];

// Function to group overlapping courses
const groupOverlappingCourses = (courses) => {
  const groups = [];
  courses.forEach(course => {
    let added = false;
    for (const group of groups) {
      if (group.some(c => (c.fromTime < course.toTime && c.toTime > course.fromTime
          && c.day === course.day
      ))) {
        group.push(course);
        added = true;
        break;
      }
    }
    if (!added) {
      groups.push([course]);
    }
  });
  return groups;
};

// Main Schedule component
const Schedule = ({ pickedCourses }) => {
  const groupedCourses = groupOverlappingCourses(pickedCourses);
  
  return (
    <div className="schedule-grid">
      {/* Render the fixed day headers (Sunday to Thursday) */}
      <div className="day-headers">
        {days.map((day, index) => (
          <div key={index} className="day-header">{day}</div>
        ))}
      </div>

      {/* Render the time labels (hours only) */}
      <div className="time-labels">
        {fixedTimeSlots.map((time, index) => (
          <div key={index} className="time-slot">{time}</div>
        ))}
      </div>

      {/* Render the predefined course blocks */}
      <div className="course-blocks">
        {groupedCourses.map((group, groupIndex) => {
          return group.map((course, courseIndex) => {
            const primaryPosition = calculateGridPosition(course, 9); // 9 is the minimal hour (09:00)
            const secondaryPosition = course.day2 ? calculateGridPosition(course, 9, true) : null;

            return (
              <React.Fragment key={course.id}>
                <div
                  className="course-block"
                  style={{
                    gridRow: `${primaryPosition.startRow} / ${primaryPosition.endRow}`,
                    gridColumn: `${primaryPosition.dayColumn} / span 1`,
                    zIndex: 1, // Ensure overlapping courses are visible
                    width: `${100 / group.length}%`,
                    left: `${(100 / group.length) * courseIndex}%`
                  }}
                >
                  <div className="course-title">{course.title}</div>
                  <div className="course-time">{`${formatTime(course.fromTime)} - ${formatTime(course.toTime)}`}</div>
                  <div className="course-location">{course.location}</div>
                </div>
                {secondaryPosition && (
                  <div
                    className="course-block"
                    style={{
                      gridRow: `${secondaryPosition.startRow} / ${secondaryPosition.endRow}`,
                      gridColumn: `${secondaryPosition.dayColumn} / span 1`,
                      zIndex: 1, // Ensure overlapping courses are visible
                      width: `${100 / group.length}%`,
                      left: `${(100 / group.length) * courseIndex}%`
                    }}
                  >
                    <div className="course-title">{course.title}</div>
                    <div className="course-time">{`${formatTime(course.fromTime2)} - ${formatTime(course.toTime2)}`}</div>
                    <div className="course-location">{course.location}</div>
                  </div>
                )}
              </React.Fragment>
            );
          });
        })}
      </div>
    </div>
  );
};

export default Schedule;