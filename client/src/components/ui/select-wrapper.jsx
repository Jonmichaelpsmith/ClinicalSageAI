import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

/**
 * EnhancedSelect component
 * 
 * A wrapper around the shadcn Select component that properly displays selected values
 * instead of always showing placeholder text.
 * 
 * @param {Object} props
 * @param {string} props.value - Selected value
 * @param {Function} props.onValueChange - Value change handler
 * @param {string} props.placeholder - Placeholder text when no value is selected
 * @param {Object} props.options - Map of option values to display labels
 * @param {string} props.className - Class name for the trigger element
 * @param {React.ReactNode} props.children - Additional content to render in the select
 * @param {Object} props.triggerProps - Additional props for the trigger element
 * @returns {React.ReactElement}
 */
export const EnhancedSelect = ({
  value,
  onValueChange,
  placeholder = "Select an option",
  options = {},
  className = "",
  children,
  triggerProps = {},
  ...props
}) => {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      <SelectTrigger className={className} {...triggerProps}>
        <SelectValue>
          {value ? options[value] || value : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {children || 
          Object.entries(options).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  );
};

export default EnhancedSelect;