import React from 'react';

const Tab = ({ label, ...props }) => {
  return (
    <button role="tab" {...props}>
      {label}
    </button>
  );
};

Tab.displayName = 'Tab';

export default Tab;
