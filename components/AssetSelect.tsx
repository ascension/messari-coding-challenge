import { useColorMode, useColorModeValue } from "@chakra-ui/react";
import Select, { Props, GroupBase } from "react-select";

type AssetOption = {
  label: string;
  value: string;
};

export const AssetSelect: React.FC<
  Props<AssetOption, false, GroupBase<AssetOption>>
> = (props) => {
  const { colorMode } = useColorMode();
  const selectBg = useColorModeValue("white", "#15181C");
  const isLightMode = colorMode === "light";

  return (
    <Select
      styles={{
        menu: (provided) => ({
          ...provided,
          background: selectBg,
        }),
        control: (provided) => ({
          ...provided,
          background: isLightMode ? "white" : "#15181C",
          color: isLightMode ? "#15181C" : "white",
        }),
        singleValue: (provided) => ({
          ...provided,
          color: isLightMode ? "#15181C" : "white",
        }),
        option: (provided, state) => ({
          ...provided,
          color:
            state.isFocused || state.isSelected
              ? "white"
              : isLightMode
              ? "black"
              : "white",
          background:
            state.isFocused || state.isSelected ? "#0091EA" : "transparent",
        }),
        container: (provided) => ({
          ...provided,
          width: "50%",
        }),
      }}
      {...props}
    />
  );
};
