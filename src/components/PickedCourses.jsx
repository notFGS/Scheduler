import React from 'react';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const PickedCourses = ({ pickedCourses, removeCourse, showCourseDetails }) => {
  return (
    <List>
      {pickedCourses.length > 0 ? (
        pickedCourses.map(course => (
          <ListItem key={course.id}>
            <ListItemText 
              primary={`${course.id} - ${course.title}`} 
              onClick={() => showCourseDetails(course)} 
            />

            {/* Remove Course Button */}
            <IconButton
              edge="end"
              aria-label="remove"
              onClick={() => removeCourse(course.id, course.semester)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))
      ) : (
        <ListItem>
          <ListItemText primary="- No Courses Chosen -" />
        </ListItem>
      )}
    </List>
  );
};

export default PickedCourses;
