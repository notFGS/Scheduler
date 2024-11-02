import React, { useEffect, useState } from 'react';
import { Container, Grid, Tabs, Tab, Typography, Button, Tooltip} from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Cookies from 'js-cookie'
/* import axios from 'axios'; */
import AutocompleteSearch from './components/AutocompleteSearch';
import PickedCourses from './components/PickedCourses';
import Schedule from './components/Schedule';
import DeleteIcon from '@mui/icons-material/Delete';
import BrowseModal from './components/BrowseModal';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import { exportToPng, exportToPdf, exportToIcs, loadIcsFile } from './utils/exportUtils';

function App() {
  const [courses, setCourses] = useState([]);   // All available courses
  const [pickedCourses, setPickedCourses] = useState(() => {
    const savedPickedCourses = Cookies.get('pickedCourses');
    return savedPickedCourses ? JSON.parse(savedPickedCourses) : { 1: [], 2: [], 0: [] };
  });
  const [availableSemesters] = useState([1, 2]); // Initialize with Semester 1 and 2
  const [activeSemester, setActiveSemester] = useState(1); // Default to Semester 1
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);  // State to control course browsing modal
  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);  // State to control options dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);  // State to control confirm dialog
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

  // Open the browse courses modal
  const handleBrowseCoursesOpen = () => {
    setIsBrowseModalOpen(true);
  };

  // Close the browse courses modal
  const handleBrowseCoursesClose = () => {
    setIsBrowseModalOpen(false);
  };

  // Open the options dialog
  const handleOptionsDialogOpen = () => {
    setIsOptionsDialogOpen(true);
  };

  // Close the options dialog
  const handleOptionsDialogClose = () => {
    setIsOptionsDialogOpen(false);
  };

  // Open the confirm dialog
  const handleConfirmDialogOpen = () => {
    if (pickedCourses[activeSemester].length === 0 && 
        pickedCourses[0].length === 0) {
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  // Close the confirm dialog
  const handleConfirmDialogClose = () => {
    setIsConfirmDialogOpen(false);
  };

  // Confirm and clear picked courses
  const handleConfirmClearCourses = () => {
    setPickedCourses(prevState => {
      const updatedPickedCourses = { ...prevState };
      updatedPickedCourses[activeSemester] = [];
      updatedPickedCourses[0] = [];
      Cookies.set('pickedCourses', JSON.stringify(updatedPickedCourses), { expires: 7 });
      return updatedPickedCourses;
    });
    handleConfirmDialogClose();
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
      
      {/* Grid for the tabs, buttons, and search field */}
        <Grid container spacing={2} alignItems="center" marginBottom={1}>
          {/* Dynamically Generate Tabs for Available Semesters */}
          {availableSemesters.length > 0 && activeSemester && (
            <Grid item sm="auto">
              <Tabs 
                value={activeSemester} 
                onChange={handleSemesterChange} 
                aria-label="Semester Tabs"
              >
                {availableSemesters.map(semester => (
                  <Tab key={semester} value={semester} label={`Semester ${semester}`} />
                ))}
              </Tabs>
            </Grid>
          )}

          {/* Browse Courses Button */}
          <Grid item sm="auto">
            <Tooltip title="Browse Courses"
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
              }}>
              
              <IconButton
                onClick={handleBrowseCoursesOpen}
                style={{color: "#347aeb"}}
                size='small'
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          {/* Clear Picked Courses Button */}
          <Grid item sm="auto">
            <Tooltip title="Clear Courses" placement="bottom"
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
              }}>
              <IconButton
                variant="contained"
                size="small"
                onClick={handleConfirmDialogOpen}
                style={{color: '#eb5834' }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          {/* Quick Course Search Field */}
          <Grid item xs={10} sm={4} marginTop={-1}>
            <AutocompleteSearch 
              courses={filteredCourses}  // Pass filtered courses to AutocompleteSearch
              addCourse={addCourse}
            />
          </Grid>

          {/* More Options Button */}
          <Grid item sm="auto" marginBottom={-2} marginLeft={-2}>
            <Tooltip title="More Options"
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
              }}>
            <IconButton onClick={handleOptionsDialogOpen}
                        size='small'
            >
              <MoreVertIcon />
            </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Grid for the schedule and course selection */}
        {activeSemester && pickedCourses[activeSemester] && (
          <Grid container spacing={3}>
            {/* Schedule: Weekly Calendar */}
            <Grid item xs={12} sm={7} md={8} marginTop={2}>
              <Schedule 
                pickedCourses={[...(pickedCourses[activeSemester] || []), ...(pickedCourses[0] || [])]} 
                removeCourse={removeCourse}
                courseColors={courseColors}
                handleColorChange={handleColorChange}
              />
            </Grid>

            {/* Right Sidebar: Picked Courses */}
            <Grid item xs={12} sm={5} md={4} marginTop={-1.5} sx={{ display: { xs: 'block', sm: 'block' } }}>
              {/* Picked Courses List */}
              <PickedCourses 
                pickedCourses={[...(pickedCourses[activeSemester] || []), ...(pickedCourses[0] || [])]} // Show picked courses for active (and yearly) semester
                removeCourse={removeCourse}
                courseColors={courseColors}
              />
            </Grid>
          </Grid>
        )}

        {/* Course Browsing Modal */}
        <BrowseModal
          isBrowseModalOpen={isBrowseModalOpen}
          handleBrowseCoursesClose={handleBrowseCoursesClose}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          hideOverlapping={hideOverlapping}
          setHideOverlapping={setHideOverlapping}
          showFromTimeFilter={showFromTimeFilter}
          setShowFromTimeFilter={setShowFromTimeFilter}
          fromTime={fromTime}
          setFromTime={setFromTime}
          filterSemester={filterSemester}
          setFilterSemester={setFilterSemester}
          selectedDays={selectedDays}
          handleDaysChange={handleDaysChange}
          selectedFields={selectedFields}
          handleFieldsChange={handleFieldsChange}
          fieldOfStudyOptions={fieldOfStudyOptions}
          generateTimeOptions={generateTimeOptions}
          browseFilteredCourses={browseFilteredCourses}
          pickedCourses={pickedCourses}
          addCourse={addCourse}
          removeCourse={removeCourse}
      />

      {/* Options Dialog */}
      <Dialog open={isOptionsDialogOpen} onClose={handleOptionsDialogClose}>
        <DialogTitle>Export and Import Options</DialogTitle>
        <DialogContent>
          <Button onClick={exportToPng}>Export to PNG</Button>
          <Button onClick={exportToPdf}>Export to PDF</Button>
          <Button onClick={exportToIcs}>Export to ICS</Button>
          <input
            accept=".ics"
            style={{ display: 'none' }}
            id="load-ics-file"
            type="file"
            onChange={loadIcsFile}
          />
          <label htmlFor="load-ics-file">
            <Button component="span">Load ICS File</Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOptionsDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmDialogOpen} onClose={handleConfirmDialogClose}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to clear all courses from the current semester?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmClearCourses} color="warning">
            Confirm
          </Button>
        </DialogActions>
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
        <Typography variant="body2" color="textPrimary" style={{ textAlign: 'left' }}>
          App created by Itai Madar.
        </Typography>
      </header>
    </Container>
  );
};
  
  export default App;

