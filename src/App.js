import React, { useEffect, useState } from 'react';
import { Container, Grid, Tabs, Tab, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, MenuItem, List, ListItem, ListItemText, IconButton, Checkbox, FormControl, InputLabel, Select, OutlinedInput, Chip, FormControlLabel, Tooltip } from '@mui/material';
import Cookies from 'js-cookie'
/* import axios from 'axios'; */
import AutocompleteSearch from './components/AutocompleteSearch';
import PickedCourses from './components/PickedCourses';
import Schedule from './components/Schedule';
/* import ExportButtons from './components/ExportButtons'; */
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

function App() {
  const [courses, setCourses] = useState([]);   // All available courses
  const [pickedCourses, setPickedCourses] = useState(() => {
    const savedPickedCourses = Cookies.get('pickedCourses');
    return savedPickedCourses ? JSON.parse(savedPickedCourses) : { 1: [], 2: [], 3: [] };
  });
  const [availableSemesters, setAvailableSemesters] = useState([1, 2]); // Initialize with Semester 1 and 2
  const [activeSemester, setActiveSemester] = useState(1); // Default to Semester 1
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null); // For the info dialog
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);  // State to control course browsing modal
  const [searchQuery, setSearchQuery] = useState('');  // Search query for course browsing
  const [filterSemester, setFilterSemester] = useState('');  // Filter by semester in modal
  const [selectedDays, setSelectedDays] = useState([]);  // Multi-select for day filtering
  const [selectedFields, setSelectedFields] = useState([]);  // Multi-select for field of study
  const [fieldOfStudyOptions, setFieldOfStudyOptions] = useState([]); // Available fields of study for the dropdown
  const [hideOverlapping, setHideOverlapping] = useState(false); // State to control hiding of overlapping courses
  const [showFromTimeFilter, setShowFromTimeFilter] = useState(false); // State to control visibility of fromTime filter
  const [fromTime, setFromTime] = useState('') // State to manage fromTime filter
  const [courseColors, setCourseColors] = useState({}); // State to manage course colors



  const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  // Fetch courses from the local file
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/courses.json`)  // Adjusted for GitHub Pages
    .then(response => response.json())
    .then(fetchedCourses => {
      const courses = fetchedCourses.map(course => {
        // Verify id is a non-empty string or number
        const id = course.id && (typeof course.id === 'string' || typeof course.id === 'number') ? course.id : 'Unknown ID';
      
        // Verify semester is a valid number
        const semester = course.semester && typeof course.semester === 'number' ? course.semester : 0; // Default to 0 if invalid
      
        // Verify schedule is an array and contains valid entries
        const schedule = Array.isArray(course.schedule) && course.schedule.every(slot => 
          validDays.includes(slot.day) &&
          timeFormatRegex.test(slot.fromTime) &&
          timeFormatRegex.test(slot.toTime) &&
          slot.location && typeof slot.location === 'string'
        ) ? course.schedule : [];
      
        return {
          id,
          semester,
          title: course.title,
          fields: course.fields,
          schedule,  // Directly use verified schedule array
          startDate: course.startDate,
          endDate: course.endDate,
          URL: course.URL,
          INDEX: course.INDEX,
        };
      });

        courses.sort((a, b) => {return a.title.localeCompare(b.title);}); // Sort courses alphabetically by title
      
        // Extract unique fields of study from the "fields" attribute
        const uniqueFields = [...new Set(courses.flatMap(course => course.fields || []))];  // Flatten the fields arrays and remove duplicates
        uniqueFields.sort((a, b) => {
          if (a.startsWith("Phys") && !b.startsWith("Phys")) return -1; // Sort Physics first
          if (!a.startsWith("Phys") && b.startsWith("Phys")) return 1; 
          return a.localeCompare(b);
        });
        setFieldOfStudyOptions(uniqueFields);
        setCourses(courses);
    })
    .catch(error => {
        console.error('Error fetching courses:', error);
    });
}, []);

  useEffect(() => {
    if (window.goatcounter) {
      window.goatcounter.count();
    }
  }, []);

  // Add course to the correct semester (ONLY when the user selects it)
  const addCourse = (course) => {
    console.log('Adding course:', course);  // Log the course being added

    setPickedCourses(prevState => {
      const updatedPickedCourses = { ...prevState };

      // Ensure that the semester exists in pickedCourses before adding the course
      if (!updatedPickedCourses[course.semester]) {
        updatedPickedCourses[course.semester] = [];
      }

      // Prevent duplicate course additions
      if (!updatedPickedCourses[course.semester].some(pickedCourse => pickedCourse.id === course.id)) {
        // Add the course to the correct semester
        updatedPickedCourses[course.semester].push(course);

        Cookies.set('pickedCourses', JSON.stringify(updatedPickedCourses), { expires: 7 });

        return updatedPickedCourses;
      }

      return prevState;  // No changes if course is already added
    });
  };

  // Remove course from the correct semester
  const removeCourse = (courseId, semester) => {
    setPickedCourses(prevState => {
      // Ensure the semester exists before modifying the state
      if (!prevState[semester]) {
        console.error(`Semester ${semester} is not defined in pickedCourses.`);
        return prevState; // Return the state unchanged if the semester doesn't exist
      }
  
      // Update the state by removing the course
      const updatedSemesterCourses = prevState[semester].filter(course => course.id !== courseId);
      
      const updatedPickedCourses = {
        ...prevState,
        [semester]: updatedSemesterCourses,
      };

      Cookies.set('pickedCourses', JSON.stringify(updatedPickedCourses), { expires: 7 });

      return updatedPickedCourses;
    });
  
    console.log('Course removed, updated pickedCourses:', pickedCourses);
  };
  
  

  // Handle tab change (semester change)
  const handleSemesterChange = (event, newValue) => {
    setActiveSemester(newValue);
    console.log('Active semester changed to:', newValue);  // Debug log
  };

  const handleShowCourseDetails = (course) => {
    setSelectedCourseDetails(course);
  };

  const handleCloseDetails = () => {
    setSelectedCourseDetails(null);
  };

  // Open the browse courses modal
  const handleBrowseCoursesOpen = () => {
    setIsBrowseModalOpen(true);
  };

  // Close the browse courses modal
  const handleBrowseCoursesClose = () => {
    setIsBrowseModalOpen(false);
  };

  // Function to handle multi-select for days
  const handleDaysChange = (event) => {
    const { value } = event.target;
    setSelectedDays(typeof value === 'string' ? value.split(',') : value);
  };

  // Function to handle multi-select for fields
  const handleFieldsChange = (event) => {
    const { value } = event.target;
    setSelectedFields(typeof value === 'string' ? value.split(',') : value);
  };

  // Function to handle from time change
  const handleFromTimeChange = (event) => {
    setFromTime(event.target.value);
  };


  // Generate time options for the dropdown
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${String(hour).padStart(2, '0')}:00`;
      times.push(time);
    }
    return times;
  };

  // Filter out picked courses from the available course list
  const filteredCourses = courses.filter(course => 
    !Object.values(pickedCourses).some(semesterCourses => 
      semesterCourses.some(pickedCourse => pickedCourse.id === course.id)
    )
  );

  // Detect if a course overlaps with any picked courses
  const doesCourseOverlap = (course) => {
    return Object.values(pickedCourses).some(semesterCourses => 
      semesterCourses.some(pickedCourse => 
      course.schedule.some(courseSchedule => 
        pickedCourse.schedule.some(pickedSchedule => 
        courseSchedule.day === pickedSchedule.day && 
        (course.semester === pickedCourse.semester || course.semester === 0 || pickedCourse.semester === 0) && 
        courseSchedule.fromTime < pickedSchedule.toTime && 
        courseSchedule.toTime > pickedSchedule.fromTime
        )
      )
      )
    );
  };

  // Function to handle color change for a course
  const handleColorChange = (courseId) => {
    setCourseColors(prevColors => {
      const newColor = `#${Math.floor(Math.random()*16777215).toString(16)}`; // Generate a random color
      return { ...prevColors, [courseId]: newColor };
    });
  };


  // Function to handle color change manually for a course
  const handleColorChangeManual = (courseId) => {
    const newColor = prompt('Enter a new color (e.g., #ff0000 or red):');
    if (newColor) {
      setCourseColors(prevColors => ({
        ...prevColors,
        [courseId]: newColor
      }));
    }
  };

// Filter courses in the modal based on the search query and filters (OR condition for days/fields)
const browseFilteredCourses = courses.filter(course => {
  const courseIdStr = course.id ? course.id.toString().toLowerCase() : '';  // Convert id to string safely

  const matchesDay = selectedDays.length === 0 || selectedDays.some(day => course.schedule.some(scheduleEntry => scheduleEntry.day === day)); // OR logic for days
  const matchesField = selectedFields.length === 0 || selectedFields.some(field => course.fields.includes(field)); // OR logic for fields
  const matchesFromTime = fromTime === '' || course.schedule.some(slot => slot.fromTime >= fromTime);


  // Check if the course should be hidden due to overlap
  if (hideOverlapping && doesCourseOverlap(course)) {
    return false;
  }


  return (
    (searchQuery === '' || courseIdStr.includes(searchQuery.toLowerCase()) || course.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterSemester === '' || course.semester === filterSemester) &&
    matchesDay && matchesField && matchesFromTime
  );
});


  return (
    <Container>
      {/* Debug log */}
      {console.log('Active Semester during render:', activeSemester)}
      {console.log('Picked courses during render:', pickedCourses)}
      
      {/* Dynamically Generate Tabs for Available Semesters */}
      {availableSemesters.length > 0 && activeSemester && (
        <Tabs 
          value={activeSemester} 
          onChange={handleSemesterChange} 
          aria-label="Semester Tabs"
        >
          {availableSemesters.map(semester => (
            <Tab key={semester} value={semester} label={`Semester ${semester}`} />
          ))}
        </Tabs>
      )}

      {/* header or made by text */}
      <header style={{ textAlign: 'right', marginTop: '-25px' }}>
        <Typography variant="body2" color="textSecondary">
          Created by Itai Madar
          <br /> Inspired by bid-it
        </Typography>
      </header>

      {/* Grid for the schedule and course selection */}
      {activeSemester && pickedCourses[activeSemester] && (
        <Grid container spacing={3}>
          {/* Schedule: Weekly Calendar */}
          <Grid item xs={12} sm={8} marginTop={2}>
            <Schedule 
              pickedCourses={[...(pickedCourses[activeSemester] || []), ...(pickedCourses[0] || [])]} 
              removeCourse={removeCourse}
              courseColors={courseColors}
              handleColorChange={handleColorChange}
            />
          </Grid>

          {/* Right Sidebar: Picked Courses */}
          <Grid item xs={12} sm={4} md ={4} marginTop={2}>
            {/* Browse Courses Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleBrowseCoursesOpen}
              style={{ marginBottom: '10px',
                       marginTop: '-20px'
              }}
            >
              Browse Courses
            </Button>
            
            <Tooltip title="Clear all picked courses" placement="bottom">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setPickedCourses({ 1: [], 2: [], 3: [] });
                Cookies.set('pickedCourses', JSON.stringify({ 1: [], 2: [], 3: [] }), { expires: 7 });
              }}
              style={{ marginBottom: '10px', marginTop: '-20px', marginLeft: "5px", backgroundColor: '#ff6666' }}
            >
              <DeleteIcon />
            </Button>
            </Tooltip>

            {/* Search Bar */}
            <AutocompleteSearch 
              courses={filteredCourses}  // Pass filtered courses to AutocompleteSearch
              addCourse={addCourse}
            />

            {/* Picked Courses List */}
            <PickedCourses 
              pickedCourses={[...(pickedCourses[activeSemester] || []), ...(pickedCourses[0] || [])]} // Show picked courses for active (and yearly) semester
              removeCourse={removeCourse}
              showCourseDetails={handleShowCourseDetails}
              courseColors={courseColors}
            />
          </Grid>
        </Grid>
      )}

      {/* Course Browsing Modal */}
      <Dialog open={isBrowseModalOpen} onClose={handleBrowseCoursesClose} maxWidth="md" fullWidth >
        <DialogTitle>Browse Courses</DialogTitle>
        <DialogContent>

          {/* Search Field */}
          <TextField
            label="Search by Name or ID"
            variant="outlined"
            fullWidth
            margin="dense"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={hideOverlapping}
                onChange={(e) => setHideOverlapping(e.target.checked)}
              />
            }
            label="Hide Overlapping Courses"
          />

          {/* Checkbox to show/hide fromTime filter */}
          <FormControlLabel
              control={
                <Checkbox
                  checked={showFromTimeFilter}
                  onChange={(e) => {
                    setShowFromTimeFilter(e.target.checked);
                    if (!e.target.checked) {
                      setFromTime(''); // Reset fromTime when checkbox is unchecked
                    }
                  }}
                />
              }
              label="Enable Developer Options"
            />

          {/* Semester Filter */}
          <TextField
            select
            label="Filter by Semester"
            variant="outlined"
            fullWidth
            margin="dense"
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
          >
            <MenuItem value="">All Semesters</MenuItem>
            <MenuItem value={1}>Semester 1</MenuItem>
            <MenuItem value={2}>Semester 2</MenuItem>
            <MenuItem value={0}>Yearly \ Summer</MenuItem>
          </TextField>

          {/* Days Multi-Select Filter */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Filter by Days</InputLabel>
            <Select
              multiple
              value={selectedDays}
              onChange={handleDaysChange}
              input={<OutlinedInput label="Filter by Days" />}
              renderValue={(selected) => (
                <div>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </div>
              )}
            >
              {validDays.map((day) => (
                <MenuItem key={day} value={day}>
                  <Checkbox checked={selectedDays.indexOf(day) > -1} />
                  {day}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Field of Study Multi-Select Filter */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Filter by Field of Study</InputLabel>
            <Select
              multiple
              value={selectedFields}
              onChange={handleFieldsChange}
              input={<OutlinedInput label="Filter by Field of Study" />}
              renderValue={(selected) => (
                <div>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </div>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 280, // Set the maximum height for the dropdown menu
                  },
                },
              }}
            >
              {fieldOfStudyOptions.map((field) => (
                <MenuItem key={field} value={field}>
                  <Checkbox checked={selectedFields.indexOf(field) > -1} />
                  {field}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          {/* From Time Filter */}
          {showFromTimeFilter && (
            <FormControl fullWidth margin="dense">
              <InputLabel>I don't want to get up before...</InputLabel>
              <Select
                value={fromTime}
                onChange={handleFromTimeChange}
                input={<OutlinedInput label="I don't want to get up before..." />}
              >
                {generateTimeOptions().map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* List of Filtered Courses */}
          <div style={{ minHeight: '200px', maxHeight: '400px', overflowY: 'auto' }}>
            <List>
              {browseFilteredCourses.map(course => {
                const isPicked = pickedCourses[course.semester]?.some(pickedCourse => pickedCourse.id === course.id);

                return (
                  <ListItem key={course.id} button={true}>
                    <ListItemText primary={`${course.id} - ${course.title}`} />
                    {isPicked ? (
                      <>
                        <Tooltip title="More information"      
                        slotProps={{
                                    popper: {
                                      modifiers: [
                                        {
                                          name: 'offset',
                                          options: {
                                            offset: [0, -14],
                                          },
                                        },
                                      ],
                                    },
                                  }}
                        >
                          <IconButton
                            edge="end"
                            aria-label="info"
                            onClick={() => window.open(course.URL, '_blank')}
                            sx={{ marginRight: 1 }} // Custom styling for InfoIcon
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Remove course"
                                                slotProps={{
                                                  popper: {
                                                    modifiers: [
                                                      {
                                                        name: 'offset',
                                                        options: {
                                                          offset: [0, -14],
                                                        },
                                                      },
                                                    ],
                                                  },
                                                }}
                        >
                          <IconButton
                            edge="end"
                            aria-label="remove"
                            onClick={() => removeCourse(course.id, course.semester)}

                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Add course"
                      slotProps={{
                        popper: {
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, -14],
                              },
                            },
                          ],
                        },
                      }}
                      > 
                      <IconButton
                        edge="end"
                        aria-label="add"
                        onClick={() => addCourse(course)}

                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </div>
        </DialogContent>
      </Dialog>

      <header style={{ textAlign: 'center', marginTop: '25px', marginBottom: '25px'}}>
        <Typography variant="body2" color="textPrimary">
          Course data may not be up-to-date. Please verify with the official schedule.
        </Typography>
        <Typography variant="body2" color="textPrimary">
          Have suggestions? Submit them <a href="https://freesuggestionbox.com/pub/nzuzbfb" target="_blank" rel="noopener noreferrer">here</a>.
        </Typography>
        <Typography variant="body2" color="textPrimary" style={{ textAlign: 'left', marginTop: '25px' }}>
          <em> Release Notes: </em> You can now add some color to your life by clicking on the course blocks!
        </Typography>
      </header>
    </Container>
  );
};
  
  export default App;

