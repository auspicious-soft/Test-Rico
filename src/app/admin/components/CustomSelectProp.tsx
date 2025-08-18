import React from "react";
import Select, { StylesConfig, OptionsOrGroups, GroupBase, ActionMeta, MultiValue, SingleValue, components } from "react-select";

interface OptionType {
  value: string;
  label: string;
  matchScore?: number;
  bestMatch?: boolean;
  availabilityMatch?: boolean;
  specialtyMatchCount?: number;
}

interface CustomSelectProps {
  value: SingleValue<OptionType> | MultiValue<OptionType>;
  onChange: (
    selectedOption: SingleValue<OptionType> | MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => void;
  options: OptionsOrGroups<OptionType, GroupBase<OptionType>>;
  isMulti?: boolean;
  placeholder?: string;
  isSearchable?: boolean;
  name?: string;
  required?: boolean;
}

const customStyles: StylesConfig<OptionType, boolean> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "white",
    borderColor: "#CDE3F1",
    boxShadow: "none",
    ":hover": {
      borderColor: "#CDE3F1",
    },
    padding: "3px 10px",
    borderRadius: "10px",
    alignItems: "center",
  }),
  placeholder: (styles) => ({
    ...styles,
    color: "#6B6B6B",
    fontSize: "14px",
  }),
  input: (styles) => ({
    ...styles,
    margin: "0",
    padding: "0",
    height: "42px",
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isDisabled
      ? undefined
      : isSelected && isFocused
      ? "#1e2a47"
      : isSelected
      ? "#283C63"
      : isFocused
      ? "#d1d5db"
      : undefined,
    color: isDisabled
      ? "#ccc"
      : isSelected
      ? "white"
      : "black",
    cursor: isDisabled ? "not-allowed" : "pointer",
    padding: 4,
    ":active": {
      ...styles[":active"],
      backgroundColor: !isDisabled
        ? isSelected
          ? "#1e2a47"
          : "#d1d5db"
        : undefined,
    },
    borderRadius: "8px",
  }),
  multiValue: (styles) => ({
    ...styles,
    backgroundColor: "#283C63",
    color: "white",
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    color: "white",
    padding: 6,
    borderRadius: "2rem",
  }),
  menuList: (styles) => ({
    ...styles,
    padding: '8px',
    borderRadius: '16px',
    backgroundColor: 'white',
    cursor: 'pointer',
  }),
  menu: (styles) => ({
    ...styles,
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 100,
  }),
};

// Custom Option component to display flags
const Option = (props: any) => {
  const { data } = props;

  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between">
        <span>{data.label}</span>
        <div className="flex gap-2">
          {data.bestMatch && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Best Match</span>
          )}
          {data.availabilityMatch && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Available</span>
          )}
          {data.specialtyMatchCount && data.specialtyMatchCount > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Specialty ({data.specialtyMatchCount})
            </span>
          )}
        </div>
      </div>
    </components.Option>
  );
};

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  isMulti = false,
  placeholder = "Select...",
  isSearchable = true,
  name,
  required = true,
}) => {
  const handleChange = (
    selectedOption: SingleValue<OptionType> | MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    const event = {
      target: {
        name,
        value: selectedOption,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    onChange(selectedOption, actionMeta);
  };

  return (
    <div className="state-select h-auto">
      {name && (
        <label htmlFor={name} className="block mb-2">
          {name}
        </label>
      )}
      <Select
        id={name}
        value={value}
        onChange={handleChange}
        options={options}
        styles={customStyles}
        placeholder={placeholder}
        isMulti={isMulti}
        isSearchable={isSearchable}
        isClearable={true}
        required={required}
        components={{ Option }} // Use custom Option component
      />
    </div>
  );
};

export default CustomSelect;