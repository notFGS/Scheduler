import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

const AutocompleteSearch = ({ courses, addCourse }) => {
  return (
    <Autocomplete
      options={courses}
      getOptionLabel={(course) => `${course.id} - ${course.title}`}  // Customize the label
      onChange={(event, newValue) => {
        if (newValue) {
          console.log('Selected Course (Full Object):', newValue);  // Log the selected course
          console.log('Selected Course Semester:', newValue.semester);  // Log the semester value specifically
          
          // Ensure semester is present before adding the course
          if (newValue.semester !== undefined) {
            addCourse(newValue);  // Trigger addCourse with the selected course
          } else {
            console.error('Course semester is missing!');
          }
        } else {
          console.log('No course selected.');
        }
      }}
      renderInput={(params) => <TextField {...params} label="Quick Course Search" variant="outlined" />}
    />
  );
};

export default AutocompleteSearch;
