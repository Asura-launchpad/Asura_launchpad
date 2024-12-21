import { useEffect, useRef, useState } from 'react';
import styles from './tradingview.module.scss';

interface TradingViewChartProps {
  symbol: string;
  containerId: string;
  theme?: "light" | "dark";
  curve_progress_enabled?: boolean;
  dexaddress?: string,
  mainnet?: string,
}

const TradingViewChart = ({
  symbol,
  containerId,
  theme = 'dark',
  curve_progress_enabled = true,
  dexaddress,
  mainnet
}: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [selectedChart, setSelectedChart] = useState<'trading' | 'coingecko'>('trading');

  useEffect(() => {
    const loadTradingViewWidget = () => {
      const script = document.createElement('script');
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": symbol,
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": theme,
        "style": "1",
        "locale": "kr",
        "enable_publishing": false,
        "hide_top_toolbar": false,
        "allow_symbol_change": true,
        "save_image": true,
        "calendar": true,
        "hide_volume": false,
        "toolbar_bg": "#f1f3f6",
        "withdateranges": true,
        "support_host": "https://www.tradingview.com",
        "show_popup_button": true,
        "popup_width": "1000",
        "popup_height": "650"
      });
      
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = '';
        chartContainerRef.current.appendChild(script);
      }
    };
    const mainnetLower = mainnet?.toLowerCase();

    const loadCoinGeckoWidget = () => {
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = `
          <iframe 
            src="https://www.geckoterminal.com/${mainnetLower}/pools/${dexaddress}?embed=1&info=0&swaps=0&grayscale=1"
            style="width:100%; height:100%; border:none;"
          ></iframe>
        `;
      }
    };

    if (selectedChart === 'trading') {
      loadTradingViewWidget();
    } else {
      loadCoinGeckoWidget();
    }

  }, [symbol, theme, selectedChart]);

  return (
    <div className={styles.chartWrapper}>
      {curve_progress_enabled ? (
        <div className={styles.chartSelector}>
          <button 
            className={`${styles.selectorButton} ${selectedChart === 'trading' ? styles.active : ''}`}
            onClick={() => setSelectedChart('trading')}
          >
            Bonding Curve
          </button>
        </div>
      ) : (
        <div className={styles.chartSelector}>
          <button 
            className={`${styles.selectorButton} ${selectedChart === 'trading' ? styles.active : ''}`}
            onClick={() => setSelectedChart('trading')}
          >
            Bonding Curve
          </button>
          <button 
            className={`${styles.selectorButton} ${selectedChart === 'coingecko' ? styles.active : ''}`}
            onClick={() => setSelectedChart('coingecko')}
          >
            GeckoTerminal
          </button>
        </div>
      )}
      <div 
        id={containerId}
        ref={chartContainerRef}
        className={styles.tradingviewChart}
      />
    </div>
  );
};

export default TradingViewChart;