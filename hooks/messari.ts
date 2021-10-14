import useSWR from "swr";
import dayjs from "dayjs";

const fetcher = (url) => fetch(url).then((r) => r.json());

interface MessariResponse<T> {
  status: {
    elapsed: number;
    timestamp: string;
    error_code?: number;
    error_message?: string;
  };
  data?: T;
}

type MessariAssetMetrics = MessariResponse<{
  market_data: {
    percent_change_usd_last_24_hours: number;
    price_usd: number;
  };
  all_time_high: {
    price: number;
    percent_down: number;
    days_since: number;
  };
}>;

type MessariAsset = {
  id: string;
  symbol: string;
  name: string;
  slug: string;
  contract_addresses: Array<{ platform: string; contract_address: string }>;
  metrics: {
    market_data: MarketData;
  };
  profile: {
    is_verified: boolean;
    tagline: string;
    overview: string;
    background: string;
    technology: string;
    category: string;
    sector: string;
    tag: string;
    // more api fields available
  };
};

type MarketData = {
  price_usd: number;
  price_btc: number;
  price_eth: number;
  volume_last_24_hours: number;
  real_volume_last_24_hours: number;
  volume_last_24_hours_overstatement_multiple: number;
  percent_change_usd_last_1_hour: number;
  percent_change_btc_last_1_hour: number;
  percent_change_eth_last_1_hour: number;
  percent_change_usd_last_24_hours: number;
  percent_change_btc_last_24_hours: number;
  percent_change_eth_last_24_hours: number;
  last_trade_at: string;
};

type MessariAssets = MessariResponse<Array<MessariAsset>>;

export const useAssetMetrics = (slugOrSymbol: string) => {
  const {
    data: { data } = {},
    error,
    isValidating,
  } = useSWR<MessariAssetMetrics>(
    `https://data.messari.io/api/v1/assets/${slugOrSymbol}/metrics`,
    fetcher
  );

  return { data, error, isValidating };
};

export const useMessariAssets = () => {
  const {
    data: { data } = {},
    error,
    isValidating,
  } = useSWR<MessariAssets>("https://data.messari.io/api/v1/assets", fetcher);

  return { data, error, isValidating };
};

export type TimeSeriesIntervals =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "1d"
  | "1w";

export type MessariTimeSeries = {
  values: [
    [
      timestamp: number,
      open: number,
      close: number,
      high: number,
      low: number,
      close: number,
      volume: number
    ]
  ];
};

export type TimeSeriesTimespans = "1M" | "3M" | "1Y" | "YTD";

const getDatesForTimespan = (timespan: TimeSeriesTimespans) => {
  switch (timespan) {
    case "1M": {
      const now = dayjs();
      return {
        toDate: now.format("YYYY-MM-DD"),
        fromDate: now.subtract(1, "month").format("YYYY-MM-DD"),
        interval: "1d",
      };
    }
    case "3M": {
      const now = dayjs();
      return {
        toDate: now.format("YYYY-MM-DD"),
        fromDate: now.subtract(3, "month").format("YYYY-MM-DD"),
        interval: "1d",
      };
    }
    case "YTD": {
      const now = dayjs();
      return {
        toDate: now.format("YYYY-MM-DD"),
        fromDate: now.subtract(1, "year").format("YYYY-MM-DD"),
        interval: "1d",
      };
    }
    default: {
      const now = dayjs();
      return {
        toDate: now.format("YYYY-MM-DD"),
        fromDate: now.subtract(1, "year").format("YYYY-MM-DD"),
        interval: "1d",
      };
    }
  }
};

export const useMessariTimeSeries = (
  slugOrSymbol: string,
  timespan: TimeSeriesTimespans
) => {
  const { toDate, fromDate, interval } = getDatesForTimespan(timespan);

  const {
    data: { data } = {},
    error,
    isValidating,
  } = useSWR<MessariResponse<MessariTimeSeries>>(
    `https://data.messari.io/api/v1/assets/${slugOrSymbol}/metrics/price/time-series?start=${fromDate}&end=${toDate}&interval=${interval}`,
    fetcher
  );

  return { data, error, isValidating };
};
