import React from 'react';

const CourseColorPicker = ({ course, onColorChange }) => {
  return (
    <div>
      <span>{course.title}</span>
      <input
        type="color"
        value={course.color}
        onChange={(e) => onColorChange(course.id, e.target.value)}
        style={{ marginLeft: '8px' }}
      />
    </div>
  );
};

export default CourseColorPicker;