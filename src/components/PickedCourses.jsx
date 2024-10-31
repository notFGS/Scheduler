import React from 'react';
import { List, ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

const PickedCourses = ({ pickedCourses, removeCourse, showCourseDetails }) => {
  return (
    <div style={{ maxHeight: '820px', overflow: 'auto' }}>
      <List>
        {pickedCourses.map((course) => (
          <ListItem key={course.id}>
            <ListItemText primary={`${course.id} - ${course.title}`} />
            <Tooltip title="More information">
              <IconButton
                edge="end"
                aria-label="info"
                onClick={() => window.open(course.URL, '_blank')}
                sx={{ marginRight: 1 }} // Custom styling for InfoIcon
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove course">
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => removeCourse(course.id, course.semester)}
                // sx={{ color: 'red' }} // Custom styling for DeleteIcon
              >
                <DeleteIcon />
              </IconButton>
              </Tooltip>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default PickedCourses;