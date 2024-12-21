// 차트에 표시될 봉(캔들)의 데이터 구조 정의
interface CoinGeckoBar {
  time: number;    // 타임스탬프
  open: number;    // 시가
  high: number;    // 고가
  low: number;     // 저가
  close: number;   // 종가
  volume: number;  // 거래량
}

// CoinGecko API를 사용하여 차트 데이터를 제공하는 클래스
export class CoinGeckoDatafeed {
  private symbol: string;  // 코인 심볼 (예: bitcoin, ethereum 등)
  private lastBar: CoinGeckoBar | null = null;  // 마지막으로 처리된 봉 데이터
  private subscribers: Map<string, {  // 실시간 데이터 구독자 관리
    callback: Function;  // 업데이트 콜백 함수
    interval: ReturnType<typeof setInterval>  // 업데이트 인터벌 ID
  }> = new Map();

  // 생성자: 코인 심볼을 받아 초기화
  constructor(symbol: string) {
    this.symbol = symbol;
  }

  // 차트 라이브러리 초기화 시 호출되는 메서드
  public onReady(callback: any) {
    callback({
      supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'],  // 지원하는 시간 프레임
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
    });
  }

  // 심볼 정보를 해석하고 제공하는 메서드
  public async resolveSymbol(symbolName: string, onSymbolResolvedCallback: any, onResolveErrorCallback: any) {
    try {
      const symbolInfo = {
        name: symbolName,
        description: '',
        type: 'crypto',
        session: '24x7',  // 24시간 거래
        timezone: 'Etc/UTC',
        minmov: 1,
        pricescale: 100000000,  // 8자리 소수점 표시
        has_intraday: true,     // 일중 데이터 지원
        has_daily: true,        // 일간 데이터 지원
        has_weekly_and_monthly: true,  // 주간/월간 데이터 지원
        supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'],
        volume_precision: 8,
        data_status: 'streaming',
      };
      onSymbolResolvedCallback(symbolInfo);
    } catch (error) {
      onResolveErrorCallback('Symbol not found');
    }
  }

  // 히스토리컬 데이터를 가져오는 메서드
  public async getBars(symbolInfo: any, resolution: string, from: number, to: number, onHistoryCallback: any) {
    try {
      const data = await this.fetchCoinGeckoData(from * 1000, to * 1000);
      if (!data || !data.prices || data.prices.length === 0) {
        onHistoryCallback([], { noData: true });
        return;
      }

      const bars = this.processDataIntoBars(data);
      if (bars.length > 0) {
        this.lastBar = bars[bars.length - 1];
      }
      onHistoryCallback(bars, { noData: false });
    } catch (error) {
      console.error('Error fetching historical data:', error);
      onHistoryCallback([], { noData: true });
    }
  }

  // CoinGecko API에서 데이터를 가져오는 private 메서드
  private async fetchCoinGeckoData(from: number, to: number) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${this.symbol}/market_chart/range?vs_currency=usd&from=${Math.floor(from/1000)}&to=${Math.floor(to/1000)}`
      );
      return await response.json();
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return null;
    }
  }

  // API 응답 데이터를 차트 라이브러리가 이해할 수 있는 봉 형태로 변환
  private processDataIntoBars(data: any): CoinGeckoBar[] {
    const { prices, total_volumes } = data;
    return prices.map((price: [number, number], index: number) => {
      const time = price[0];
      const close = price[1];
      
      // 이전 가격과 현재 가격을 사용하여 OHLC 계산
      const open = index > 0 ? prices[index - 1][1] : close;
      const high = Math.max(open, close);
      const low = Math.min(open, close);
      const volume = total_volumes[index]?.[1] || 0;

      return {
        time,
        open,
        high,
        low,
        close,
        volume
      };
    });
  }

  // 실시간 데이터 구독을 처리하는 메서드
  public subscribeBars(symbolInfo: any, resolution: string, onRealtimeCallback: any, subscriberUID: string) {
    const interval = setInterval(async () => {
      try {
        if (!this.lastBar) return;

        const now = Date.now();
        const from = this.lastBar.time;
        const data = await this.fetchCoinGeckoData(from, now);
        
        // 새로운 데이터가 있으면 콜백으로 전달
        if (data && data.prices && data.prices.length > 0) {
          const bars = this.processDataIntoBars(data);
          const lastBar = bars[bars.length - 1];

          if (lastBar && lastBar.time > this.lastBar.time) {
            this.lastBar = lastBar;
            onRealtimeCallback(lastBar);
          }
        }
      } catch (error) {
        console.error('Realtime update error:', error);
      }
    }, 10000); // 10초마다 업데이트

    this.subscribers.set(subscriberUID, { callback: onRealtimeCallback, interval });
  }

  // 실시간 데이터 구독 해제를 처리하는 메서드
  public unsubscribeBars(subscriberUID: string) {
    const subscriber = this.subscribers.get(subscriberUID);
    if (subscriber) {
      clearInterval(subscriber.interval);
      this.subscribers.delete(subscriberUID);
    }
  }

  async checkDataAvailability(): Promise<boolean> {
    try {
      // 코인게코 API를 통해 데이터 존재 여부 확인
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${this.symbol}/market_chart?vs_currency=usd&days=1`
      );
      const data = await response.json();
      return data.prices && data.prices.length > 0;
    } catch (error) {
      console.error('데이터 확인 실패:', error);
      return false;
    }
  }
} 