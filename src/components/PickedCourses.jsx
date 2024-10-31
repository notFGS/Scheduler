import React from 'react';
import { List, ListItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';

const PickedCourses = ({ pickedCourses, removeCourse, courseColors }) => {
  return (
    <div>
      <List>
        {pickedCourses.map(course => (
          <ListItem 
            key={course.id} 
            sx={{ borderLeft: `4px solid ${courseColors[course.id] || '#add8e6f2'}`, borderRadius: '4px', marginBottom: '8px' }}
          >
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