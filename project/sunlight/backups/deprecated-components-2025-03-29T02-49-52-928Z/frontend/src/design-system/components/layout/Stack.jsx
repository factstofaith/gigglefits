import React from 'react';
import Box from '@design-system/components/layout/Box';

/**
 * Stack component for vertical or horizontal layouts with consistent spacing
 */
export const Stack = React.forwardRef(
  (
    {
      children,
      direction = 'column',
      spacing = 'md',
      alignItems,
      justifyContent,
      divider,
      ...props
    },
    ref
  ) => {
    const isHorizontal = direction === 'row' || direction === 'row-reverse';

    const stackItems = React.Children.toArray(children).filter(Boolean);

    return (
      <Box
        ref={ref}
        display="flex&quot;
        flexDirection={direction}
        alignItems={alignItems}
        justifyContent={justifyContent}
        {...props}
      >
        {stackItems.map((child, index) => {
          if (index === 0) {
            return <React.Fragment key={index}>{child}</React.Fragment>;
          }

          return (
            <React.Fragment key={index}>
              {divider && (
                <div
                  style={{
                    [isHorizontal ? "marginLeft' : 'marginTop']: spacing,
                    flexShrink: 0,
                  }}
                >
                  {divider}
                </div>
              )}

              <div
                style={{
                  [isHorizontal ? 'marginLeft' : 'marginTop']: divider ? spacing : spacing,
                }}
              >
                {child}
              </div>
            </React.Fragment>
          );
        })}
      </Box>
    );
  }
);

Stack.displayName = 'Stack';

export default Stack;
