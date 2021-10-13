import useSWR from "swr";
import React from "react";

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

export const useAssetMetrics = (slugOrSymbol: string) =>
  useSWR<MessariAssetMetrics>(
    `https://data.messari.io/api/v1/assets/${slugOrSymbol}/metrics`,
    fetcher
  );

export const useMessariAssets = () => {
  const {
    data: { data } = {},
    error,
    isValidating,
  } = useSWR<MessariAssets>("https://data.messari.io/api/v1/assets", fetcher);

  return { data, error, isValidating };
};

type TimeSeriesIntervals = "1m" | "5m" | "15m" | "30m" | "1h" | "1d" | "1w";

export const useMessariTimeSeries = (
  slugOrSymbol: string,
  interval: TimeSeriesIntervals = "1d"
) => {
  const {
    data: { data } = {},
    error,
    isValidating,
  } = useSWR<MessariAssets>(
    `https://data.messari.io/api/v1/assets/${slugOrSymbol}/metrics/price/time-series?start=2020-10-12&end=2021-10-12&interval=${interval}`,
    fetcher
  );

  return { data, error, isValidating };
};
