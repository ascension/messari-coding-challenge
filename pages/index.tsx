import Head from "next/head";

import {
  Heading,
  Container,
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Skeleton,
  Text,
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
import { useMessariAssets, useMessariTimeSeries } from "../hooks/messari";
import { AssetSelect } from "../components/AssetSelect";

const fetcher = (url) => fetch(url).then((r) => r.json());

const timeframes = ["1d", "1w"];

export default function Home() {
  const [timeframe, setTimeframe] = useState("1d");
  const [selectedAsset, setSelectedAsset] = useState({
    label: "Bitcoin",
    value: "bitcoin",
  });

  const handleTimeframeClick = useCallback(
    (e) => {
      setTimeframe(e.target.value);
    },
    [setTimeframe]
  );
  const { colorMode, toggleColorMode } = useColorMode();

  const { data, error, isValidating } = useMessariAssets();

  const metricsResponse = useSWR<{
    data: {
      market_data: {
        percent_change_usd_last_24_hours: number;
        price_usd: number;
      };
      all_time_high: {
        price: number;
        percent_down: number;
        days_since: number;
      };
    };
  }>(
    `https://data.messari.io/api/v1/assets/${selectedAsset.value}/metrics`,
    fetcher
  );

  const timeSeries = useMessariTimeSeries(selectedAsset.value, timeframe);

  const allTimeHigh = get(metricsResponse, "data.data.all_time_high");

  const assetOptions = data?.map(({ name, slug }) => ({
    label: name,
    value: slug,
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

      <Box as="main" p={4}>
        <Flex w="full" justify="space-between">
          <Heading>Overview</Heading>

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
                isLoaded={get(
                  metricsResponse,
                  "data.data.market_data.price_usd"
                )}
              >
                {numeral(
                  get(metricsResponse, "data.data.market_data.price_usd")
                ).format("$0,0.00")}
              </Skeleton>
            </StatNumber>
            <StatArrow
              isLoaded={get(metricsResponse, "data.data.market_data.price_usd")}
              percentage={get<typeof metricsResponse, any, number>(
                metricsResponse,
                "data.data.market_data.percent_change_usd_last_24_hours",
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
            <StatLabel>All time high(ATH)</StatLabel>
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
            <StatLabel>Days since ATH</StatLabel>
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
          {timeframes.map((tf, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              mr={2}
              isActive={tf === timeframe}
              value={tf}
              onClick={handleTimeframeClick}
              textTransform="uppercase"
            >
              {tf}
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
