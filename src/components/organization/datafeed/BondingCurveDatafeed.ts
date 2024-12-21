import { ethers } from 'ethers';

interface BondingCurveBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceEvent {
  timestamp: number;
  price: number;
  amount: number;
}

export class BondingCurveDatafeed {
  private contractAddress: string;
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;
  private lastBar: BondingCurveBar | null = null;
  private priceHistory: PriceEvent[] = [];
  private subscribers: Map<string, { callback: Function; eventListener: any }> = new Map();

  constructor(contractAddress: string, abi: any, rpcUrl: string) {
    this.contractAddress = contractAddress;
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(contractAddress, abi, this.provider);
  }

  public onReady(callback: any) {
    callback({
      supported_resolutions: ['1', '5', '15', '30', '60', '1D'],
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
    });
  }

  public async resolveSymbol(symbolName: string, onSymbolResolvedCallback: any, onResolveErrorCallback: any) {
    try {
      const symbolInfo = {
        name: symbolName,
        description: 'Bonding Curve Token',
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        minmov: 1,
        pricescale: 1000000, // 6 decimals
        has_intraday: true,
        has_daily: true,
        supported_resolutions: ['1', '5', '15', '30', '60', '1D'],
        volume_precision: 6,
        data_status: 'streaming',
      };
      onSymbolResolvedCallback(symbolInfo);
    } catch (error) {
      onResolveErrorCallback('Symbol not found');
    }
  }

  private async fetchHistoricalEvents(from: number, to: number): Promise<PriceEvent[]> {
    try {
      const filter = this.contract.filters.TokenPurchase();
      const events = await this.contract.queryFilter(filter, from, to);

      return events
        .filter(event => event.args && event.args.timestamp && event.args.price && event.args.amount)
        .map(event => ({
          timestamp: event.args!.timestamp.toNumber() * 1000,
          price: parseFloat(ethers.utils.formatEther(event.args!.price)),
          amount: parseFloat(ethers.utils.formatEther(event.args!.amount))
        }));
    } catch (error) {
      console.error('Error fetching historical events:', error);
      return [];
    }
  }

  private async getCurrentPrice(): Promise<number> {
    try {
      // 스마트 컨트랙트의 현재 가격 조회 함수 호출
      const price = await this.contract.getCurrentPrice();
      return parseFloat(ethers.utils.formatEther(price));
    } catch (error) {
      console.error('Error getting current price:', error);
      return 0;
    }
  }

  private processEventsIntoBars(events: PriceEvent[]): BondingCurveBar[] {
    if (events.length === 0) return [];

    // 이벤트를 시간순으로 정렬
    events.sort((a, b) => a.timestamp - b.timestamp);

    return events.map((event, index) => {
      const prevPrice = index > 0 ? events[index - 1].price : event.price;
      
      return {
        time: event.timestamp,
        open: prevPrice,
        high: Math.max(prevPrice, event.price),
        low: Math.min(prevPrice, event.price),
        close: event.price,
        volume: event.amount
      };
    });
  }

  public async getBars(symbolInfo: any, resolution: string, from: number, to: number, onHistoryCallback: any) {
    try {
      const events = await this.fetchHistoricalEvents(Math.floor(from), Math.floor(to));
      if (events.length === 0) {
        // 이벤트가 없는 경우 현재 가격으로 단일 바 생성
        const currentPrice = await this.getCurrentPrice();
        const bar = {
          time: from * 1000,
          open: currentPrice,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice,
          volume: 0
        };
        onHistoryCallback([bar], { noData: false });
        this.lastBar = bar;
        return;
      }

      const bars = this.processEventsIntoBars(events);
      if (bars.length > 0) {
        this.lastBar = bars[bars.length - 1];
      }
      onHistoryCallback(bars, { noData: false });
    } catch (error) {
      console.error('Error getting bars:', error);
      onHistoryCallback([], { noData: true });
    }
  }

  public subscribeBars(symbolInfo: any, resolution: string, onRealtimeCallback: any, subscriberUID: string) {
    // 실시간 이벤트 구독
    const eventListener = this.contract.on('TokenPurchase', async (buyer, amount, price, timestamp) => {
      if (!this.lastBar) return;

      const newBar = {
        time: timestamp.toNumber() * 1000,
        open: this.lastBar.close,
        high: Math.max(this.lastBar.close, parseFloat(ethers.utils.formatEther(price))),
        low: Math.min(this.lastBar.close, parseFloat(ethers.utils.formatEther(price))),
        close: parseFloat(ethers.utils.formatEther(price)),
        volume: parseFloat(ethers.utils.formatEther(amount))
      };

      this.lastBar = newBar;
      onRealtimeCallback(newBar);
    });

    this.subscribers.set(subscriberUID, { callback: onRealtimeCallback, eventListener });
  }

  public unsubscribeBars(subscriberUID: string) {
    const subscriber = this.subscribers.get(subscriberUID);
    if (subscriber) {
      // 이벤트 리스너 제거
      this.contract.off('TokenPurchase', subscriber.eventListener);
      this.subscribers.delete(subscriberUID);
    }
  }
}