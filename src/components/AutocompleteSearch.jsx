import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Popper, Button, Box } from '@mui/material';

const AutocompleteSearch = ({ courses, addCourse }) => {
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [filter, setFilter] = useState(([], [], []), (['sem1', 'sem2', 'other']));
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    applyFilter(filter);
  }, [courses, filter]);

  const applyFilter = (filter) => {
    if (filter.length === 0) {
      setFilteredCourses(courses);
    } else if (filter.includes('sem1') && filter.includes('sem2') && filter.includes('other')) {
      setFilteredCourses(courses);
    } else if (filter.includes('sem1') && filter.includes('sem2')) {
      setFilteredCourses(courses.filter(course => course.semester === 1 || course.semester === 2));
    } else if (filter.includes('sem1') && filter.includes('other')) {
      setFilteredCourses(courses.filter(course => course.semester === 1 || course.semester === 0));
    } else if (filter.includes('sem2') && filter.includes('other')) {
      setFilteredCourses(courses.filter(course => course.semester === 2 || course.semester === 0));
    } else if (filter.includes('sem1')) {
      setFilteredCourses(courses.filter(course => course.semester === 1));
    } else if (filter.includes('sem2')) {
      setFilteredCourses(courses.filter(course => course.semester === 2));
    } else if (filter.includes('other')) {
      setFilteredCourses(courses.filter(course => course.semester === 0));
    } else {
      setFilteredCourses([]);
    }
  };

  const handleFilterChange = (filterOption) => {
    setFilter(prevFilter => {
      if (prevFilter.includes(filterOption)) {
        return prevFilter.filter(f => f !== filterOption);
      } else {
        return [...prevFilter, filterOption];
      }
    });
  };

  const CustomPopper = (props) => {
    return (
      <Popper {...props} placement="bottom-start">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', p: 0 }}>
          <Button
            variant="contained"
            sx={{ flex: 1, height: 30, backgroundColor: filter.includes('sem1') ? 'primary.main' : 'grey.300', borderRadius: 0 }}
            onMouseDown={(e) => e.preventDefault()} // Prevent onBlur from being triggered
            onClick={() => handleFilterChange('sem1')}
          >
            Sem. 1
          </Button>
          <Button
            variant="contained"
            sx={{ flex: 1, height: 30, backgroundColor: filter.includes('sem2') ? 'primary.main' : 'grey.300', borderRadius: 0 }}
            onMouseDown={(e) => e.preventDefault()} // Prevent onBlur from being triggered
            onClick={() => handleFilterChange('sem2')}
          >
            Sem. 2
          </Button>
          <Button
            variant="contained"
            sx={{ flex: 1, height: 30, backgroundColor: filter.includes('other') ? 'primary.main' : 'grey.300', borderRadius: 0 }}
            onMouseDown={(e) => e.preventDefault()} // Prevent onBlur from being triggered
            onClick={() => handleFilterChange('other')}
          >
            Other
          </Button>
        </Box>
        {props.children}
      </Popper>
    );
  };

  return (
    <Autocomplete
      options={filteredCourses}
      getOptionLabel={(course) => `${course.id} - ${course.title}`}  // Customize the label
      onChange={(event, newValue) => {
        if (newValue) {
          
          // Ensure semester is present before adding the course
          if (newValue.semester !== undefined) {
            addCourse(newValue);  // Trigger addCourse with the selected course
            setFilteredCourses(prevCourses => prevCourses.filter(course => course.id !== newValue.id));
          } else {
            console.error('Course semester is missing!');
          }
        } else {
          console.log('No course selected.');
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        setOpen(true); // Keep the dropdown open
      }}
      inputValue={inputValue}
      open={open}
      clearOnBlur={false}
      clearOnEscape={false}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        // Check if the blur event is related to the filter buttons
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
      renderInput={(params) => <TextField {...params} label="Quick Course Search" variant="standard" color='tertiary'/>}
      PopperComponent={CustomPopper}
    />
  );
};

export default AutocompleteSearch;