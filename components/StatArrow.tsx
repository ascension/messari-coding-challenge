import React from "react";
import {
  StatHelpText,
  SkeletonText,
  SkeletonCircle,
  StatArrow as ChakraStatArrow,
} from "@chakra-ui/react";
import numeral from "numeral";

const StatArrow: React.FC<{
  percentage: number;
  hideArrow?: boolean;
  isLoaded?: boolean;
}> = ({ percentage, hideArrow = false, isLoaded = false }) => {
  if (!percentage) {
    return null;
  }

  return (
    <StatHelpText hidden={hideArrow} display="flex">
      <SkeletonCircle isLoaded={isLoaded} size="4">
        <ChakraStatArrow type={percentage > 0 ? "increase" : "decrease"} />
      </SkeletonCircle>
      <SkeletonText
        isLoaded={isLoaded}
        noOfLines={1}
        ml={2}
        justifyContent="center"
        display="flex"
        flexDirection="column"
      >
        {numeral(percentage).divide(100).format("0.00%")}
      </SkeletonText>
    </StatHelpText>
  );
};

export default StatArrow;
