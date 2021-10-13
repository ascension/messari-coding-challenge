import React, { useMemo, useCallback } from "react";
import { AreaClosed, Line, Bar } from "@visx/shape";
import numeral from "numeral";

import { curveMonotoneX } from "@visx/curve";
import { GridRows, GridColumns } from "@visx/grid";
import { scaleTime, scaleLinear } from "@visx/scale";
import {
  withTooltip,
  Tooltip,
  TooltipWithBounds,
  defaultStyles,
} from "@visx/tooltip";
import { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { max, extent, bisector } from "d3-array";
import { timeFormat } from "d3-time-format";
import _ from "lodash";
import { useColorModeValue } from "@chakra-ui/color-mode";

type AssetValue = [
  timestamp: number,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
];
type TooltipData = AssetValue;

// util
const formatDate = timeFormat("%b %d, '%y");
const CLOSE_IDX = 4;
const TIMESTAMP_IDX = 0;

// accessors
const getDate = (value: AssetValue) => {
  const timestamp = _.nth(value, TIMESTAMP_IDX);
  const date = new Date(timestamp);
  return date;
};

const getAssetValue = (value: AssetValue) => _.nth(value, CLOSE_IDX);
// const getStockValue = (d: AppleStock) => d.close;

const bisectDate = bisector<AssetValue, Date>(
  (value) => new Date(_.nth(value, TIMESTAMP_IDX))
).left;

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default withTooltip<AreaProps & { data: any }, TooltipData>(
  ({
    data,
    width,
    height,
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }: AreaProps & { data: any } & WithTooltipProvidedProps<TooltipData>) => {
    if (width < 10) return null;
    const timeseriesData = _.get(data, "data.values", []);

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const background = useColorModeValue("#fff", "#050309");
    const background2 = useColorModeValue("#fff", "#050309");
    const accentColor = useColorModeValue("#4A29A8", "#0091EA");
    const accentColorDark = useColorModeValue("#920ECF", "#F19837");

    const tooltipStyles = {
      ...defaultStyles,
      background,
      border: "1px solid white",
      color: "white",
    };

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [margin.left, innerWidth + margin.left],
          domain: extent(timeseriesData, getDate) as [Date, Date],
        }),
      [timeseriesData, innerWidth, margin.left]
    );

    const stockValueScale = useMemo(() => {
      const domainMax = max(timeseriesData, getAssetValue) || 0;
      return scaleLinear({
        range: [innerHeight + margin.top, margin.top],
        domain: [0, domainMax < 50 ? domainMax : domainMax + innerHeight / 3],
        nice: true,
      });
    }, [timeseriesData, margin.top, innerHeight]);

    // tooltip handler
    const handleTooltip = useCallback(
      (
        event:
          | React.TouchEvent<SVGRectElement>
          | React.MouseEvent<SVGRectElement>
      ) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(timeseriesData, x0, 1);
        const d0 = timeseriesData[index - 1];
        const d1 = timeseriesData[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d =
            x0.valueOf() - getDate(d0).valueOf() >
            getDate(d1).valueOf() - x0.valueOf()
              ? d1
              : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: stockValueScale(getAssetValue(d)),
        });
      },
      [timeseriesData, showTooltip, stockValueScale, dateScale]
    );

    return (
      <div>
        <svg width={width} height={height}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="url(#area-background-gradient)"
            rx={14}
          />
          <LinearGradient
            id="area-background-gradient"
            from={background}
            to={background2}
          />
          <LinearGradient
            id="area-gradient"
            from={accentColor}
            to={accentColor}
            toOpacity={0.1}
          />
          <GridRows
            left={margin.left}
            scale={stockValueScale}
            width={innerWidth}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0}
            pointerEvents="none"
          />
          <GridColumns
            top={margin.top}
            scale={dateScale}
            height={innerHeight}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0.2}
            pointerEvents="none"
          />
          <AreaClosed<AssetValue>
            data={timeseriesData}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => stockValueScale(getAssetValue(d)) ?? 0}
            yScale={stockValueScale}
            strokeWidth={1}
            stroke="url(#area-gradient)"
            fill="url(#area-gradient)"
            curve={curveMonotoneX}
          />
          <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                stroke={accentColorDark}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + 1}
                r={4}
                fill="black"
                fillOpacity={0.1}
                stroke="black"
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                fill={accentColorDark}
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={0}
              //   right={0}
              left={tooltipLeft + 12}
              style={tooltipStyles}
            >
              {numeral(getAssetValue(tooltipData)).format(
                // this should be more dynamic in finding the number of significant digits and adjusting the formatting.
                // to handle cases like shiba-inu
                getAssetValue(tooltipData) < 0.01 ? "$0,0.00000000" : "$0,0.00"
              )}
            </TooltipWithBounds>
            <Tooltip
              top={innerHeight + margin.top - 14}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                minWidth: 72,
                textAlign: "center",
                transform: "translateX(-50%)",
              }}
            >
              {formatDate(getDate(tooltipData))}
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
);
