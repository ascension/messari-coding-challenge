import Head from "next/head";

import {
  Container,
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Skeleton,
  Button,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import Chart from "../components/Chart";
import useSWR from "swr";
import { useCallback, useState } from "react";
import get from "lodash/get";
import numeral from "numeral";
import { ParentSize } from "@visx/responsive";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import StatArrow from "../components/StatArrow";
import {
  useMessariAssets,
  useAssetMetrics,
  useMessariTimeSeries,
  TimeSeriesIntervals,
  TimeSeriesTimespans,
} from "../hooks/messari";
import { AssetSelect } from "../components/AssetSelect";

const fetcher = (url) => fetch(url).then((r) => r.json());

const timespans: Array<TimeSeriesTimespans> = ["1M", "3M", "YTD"];

export default function Home() {
  const [timespan, setTimeframe] = useState<TimeSeriesTimespans>("YTD");
  const [selectedAsset, setSelectedAsset] = useState({
    label: "Bitcoin",
    value: "bitcoin",
    id: "",
  });

  const handleTimeframeClick = useCallback(
    (e) => {
      setTimeframe(e.target.value);
    },
    [setTimeframe]
  );
  const { colorMode, toggleColorMode } = useColorMode();

  const { data, isValidating } = useMessariAssets();
  const metricsData = useAssetMetrics(selectedAsset.value);

  const timeSeries = useMessariTimeSeries(selectedAsset.value, timespan);

  const allTimeHigh = get(metricsData, "data.all_time_high");

  const assetOptions = data?.map(({ name, slug, id }) => ({
    label: name,
    value: slug,
    id,
  }));

  return (
    <Container maxW="container.lg" height="100vh" overflow="hidden">
      <Head>
        <title>
          {selectedAsset
            ? `${selectedAsset.label} Price and Metrics | Powered by Messari`
            : "Messari Asset Details"}
        </title>
        <meta
          name="description"
          content="A simple app to retrieve crypto asset time series data and metrics"
        />
        <link rel="icon" href="/favicon-96x96.png" />
      </Head>

      <Box as="main" py={4}>
        <Flex w="full" justify="space-between">
          <AssetSelect
            options={assetOptions ?? []}
            isLoading={!data || isValidating}
            onChange={(option) => setSelectedAsset(option)}
            value={selectedAsset}
          />
          <Button onClick={toggleColorMode}>
            {colorMode === "light" ? (
              <MoonIcon w={4} h={4} />
            ) : (
              <SunIcon w={4} h={4} />
            )}
          </Button>
        </Flex>
      </Box>
      <Box my={4}>
        <StatGroup height={28}>
          <Stat
            alignSelf="stretch"
            border="1px solid black"
            my={2}
            p={2}
            mr={2}
            borderRadius="lg"
            borderColor={useColorModeValue("black", "#15181C")}
            bg={useColorModeValue("white", "#15181C")}
          >
            <StatLabel>Current Price</StatLabel>
            <StatNumber>
              <Skeleton
                isLoaded={get(metricsData, "data.market_data.price_usd")}
              >
                {numeral(get(metricsData, "data.market_data.price_usd")).format(
                  "$0,0.00"
                )}
              </Skeleton>
            </StatNumber>
            <StatArrow
              isLoaded={get(metricsData, "data.market_data.price_usd")}
              percentage={get<typeof metricsData, any, number>(
                metricsData,
                "data.market_data.percent_change_usd_last_24_hours",
                0
              )}
            />
          </Stat>

          <Stat
            border="1px solid black"
            my={2}
            p={2}
            mr={2}
            borderRadius="lg"
            borderColor={useColorModeValue("black", "#15181C")}
            bg={useColorModeValue("white", "#15181C")}
            alignSelf="stretch"
          >
            <StatLabel>All Time High(ATH)</StatLabel>
            <StatNumber>
              <Skeleton isLoaded={allTimeHigh?.price}>
                {numeral(allTimeHigh?.price).format("$0,0.00")}
              </Skeleton>
            </StatNumber>
            <StatArrow
              isLoaded={allTimeHigh?.percent_down}
              percentage={allTimeHigh?.percent_down * -1}
            />
          </Stat>

          <Stat
            border="1px solid black"
            borderColor={useColorModeValue("black", "#15181C")}
            bg={useColorModeValue("white", "#15181C")}
            my={2}
            p={2}
            borderRadius="lg"
            alignSelf="stretch"
          >
            <StatLabel>Days Since ATH</StatLabel>
            <StatNumber>
              <Skeleton isLoaded={allTimeHigh?.days_since}>
                {allTimeHigh?.days_since}
              </Skeleton>
            </StatNumber>
            <StatArrow hideArrow percentage={allTimeHigh?.percent_down * -1} />
          </Stat>
        </StatGroup>
      </Box>
      <Flex height="lg" flexDirection="column">
        <Flex justifyContent="flex-end" py={2}>
          {timespans.map((ts, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              mr={2}
              isActive={ts === timespan}
              value={ts}
              onClick={handleTimeframeClick}
              textTransform="uppercase"
            >
              {ts}
            </Button>
          ))}
        </Flex>
        <ParentSize>
          {({ height, width }) => (
            <Chart height={height} width={width} data={timeSeries} />
          )}
        </ParentSize>
      </Flex>
    </Container>
  );
}
