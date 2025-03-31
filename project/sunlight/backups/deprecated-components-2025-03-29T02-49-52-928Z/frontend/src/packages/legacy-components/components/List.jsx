import React from 'react';

/**
 * Legacy wrapper for List component
 * This provides backward compatibility with Material UI's List component
 */
const List = ({ children, dense, ...props }) => {
  // Added display name
  List.displayName = 'List';

  // Added display name
  List.displayName = 'List';

  // Added display name
  List.displayName = 'List';

  // Added display name
  List.displayName = 'List';

  // Added display name
  List.displayName = 'List';


  const style = {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    ...props.style,
  };

  return (
    <ul style={style} {...props}>
      {children}
    </ul>
  );
};

export default List;
