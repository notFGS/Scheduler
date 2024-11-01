import React from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, MenuItem, FormControlLabel, Checkbox, FormControl, InputLabel, Select, OutlinedInput, Chip, List, ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const BrowseModal = ({
  isBrowseModalOpen,
  handleBrowseCoursesClose,
  searchQuery,
  setSearchQuery,
  hideOverlapping,
  setHideOverlapping,
  showFromTimeFilter,
  setShowFromTimeFilter,
  fromTime,
  setFromTime,
  filterSemester,
  setFilterSemester,
  selectedDays,
  handleDaysChange,
  selectedFields,
  handleFieldsChange,
  fieldOfStudyOptions,
  generateTimeOptions,
  browseFilteredCourses,
  pickedCourses,
  addCourse,
  removeCourse
}) => {
  return (
    <Dialog open={isBrowseModalOpen} onClose={handleBrowseCoursesClose} maxWidth="md" fullWidth>
      <DialogTitle>Browse Courses</DialogTitle>
      <DialogContent>

      <IconButton
          edge="end"
          color="inherit"
          onClick={handleBrowseCoursesClose}
          aria-label="close"
          style={{ position: 'absolute', right:20, top:14}} // Custom styling for CloseIcon
        >
          <CloseIcon />
         </IconButton> 

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
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day) => (
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
              onChange={(e) => setFromTime(e.target.value)}
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
                    {isPicked ? (
                    <>
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
  );
};

export default BrowseModal;