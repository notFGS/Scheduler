import React from 'react';
import './Schedule.css';
import DeleteIcon from '@mui/icons-material/Delete';

// Helper function to format time in HH:MM format
const formatTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Helper function to convert time (e.g., "14:30") to fractional hours (e.g., 14.5)
const convertToFractionalHour = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
};

// Function to calculate the grid position based on time and day (15-minute intervals)
const calculateGridPosition = (timeslot, minHour) => {
  const startHour = convertToFractionalHour(timeslot.fromTime);
  const endHour = convertToFractionalHour(timeslot.toTime);

  // Multiply by 4 because each hour has 4 blocks (15-minute increments)
  // Subtract 1 from startRow to adjust the position backwards by 15 minutes
  const startRow = Math.floor((startHour - minHour) * 4) + 1; // Shift by -00:15 for the start
  const endRow = Math.floor((endHour - minHour) * 4) + 1; // Adjust by -00:15 to prevent extending block by 15 minutes

  // Correct calculation for day column
  const dayColumn = days.indexOf(timeslot.day) + 1; // Day columns should start from 1 (Sunday)

  return { startRow, endRow, dayColumn };
};

// Fixed days of the week (Sunday to Thursday)
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

// Fixed time slots for the time index (only show hours like 09:00, 10:00, etc.)
const fixedTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00'
];

// Function to group overlapping timeslots
const groupOverlappingTimeslots = (courses) => {
  const groups = [];
  courses.forEach(course => {
    course.schedule.forEach(timeslot => {
      let added = false;
      for (const group of groups) {
        if (group.some(ts => 
          ts.fromTime < timeslot.toTime && ts.toTime > timeslot.fromTime && ts.day === timeslot.day
        )) {
          group.push({ ...timeslot, course });
          added = true;
          break;
        }
      }
      if (!added) {
        groups.push([{ ...timeslot, course }]);
      }
    });
  });
  return groups;
};

// Main Schedule component
const Schedule = ({ pickedCourses, courseColors, handleColorChange, removeCourse}) => {
  const groupedTimeslots = groupOverlappingTimeslots(pickedCourses);
  
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
        {groupedTimeslots.map((group, groupIndex) => {
          return group.map((timeslot, timeslotIndex) => {
            const position = calculateGridPosition(timeslot, 9); // 9 is the minimal hour (09:00)
            const courseColor = courseColors[timeslot.course.id] || '#add8e6f2'; // Default color

            return (
              <React.Fragment key={`${timeslot.course.id}-${timeslotIndex}`}>
                <div
                  className="course-block"
                  style={{
                    gridRow: `${position.startRow} / ${position.endRow}`,
                    gridColumn: `${position.dayColumn} / span 1`,
                    zIndex: 1, // Ensure overlapping courses are visible
                    width: `${100 / group.length}%`,
                    left: `${(100 / group.length) * timeslotIndex}%`,
                    backgroundColor: courseColor // Set the background color
                  }}
                  onClick={() => handleColorChange(timeslot.course.id)} // Handle color change on click
                >
                  <div className="course-title">{timeslot.course.title}</div>
                  <div className="course-time">{`${formatTime(timeslot.fromTime)} - ${formatTime(timeslot.toTime)}`}</div>
                  <div className="course-location">{timeslot.location}</div>

                  { 'ontouchstart' in window && (
                    <div
                      className="delete-icon"
                      onTouchStart={(e) => {
                        e.preventDefault();
                        const timeout = setTimeout(() => {
                          if (window.confirm('Do you want to remove this course?')) {
                            removeCourse(timeslot.course);
                          }
                        }, 500); // Long press duration (500ms)

                        e.target.addEventListener('touchend', () => clearTimeout(timeout), { once: true });
                        e.target.addEventListener('touchmove', () => clearTimeout(timeout), { once: true });
                      }}
                    >
                      <DeleteIcon />
                    </div>
                  )}


                </div>
              </React.Fragment>
            );
          });
        })}
      </div>
    </div>
  );
};

export default Schedule;