import { ethers } from 'ethers';
import BONDING_CURVE_ABI from '../abi/bonding_curve_abi.json';

export class BondingCurveContract {
  private contract: ethers.Contract;
  private listeners: Map<string, (...args: any[]) => void> = new Map();
  
  constructor(address: string, provider: ethers.providers.Provider | ethers.providers.Web3Provider) {
    try {
      // Web3Provider인 경우
      if (provider instanceof ethers.providers.Web3Provider) {
        const signer = provider.getSigner();
        this.contract = new ethers.Contract(address, BONDING_CURVE_ABI, signer);
      } 
      // JsonRpcProvider인 경우
      else if (provider instanceof ethers.providers.JsonRpcProvider) {
        this.contract = new ethers.Contract(address, BONDING_CURVE_ABI, provider);
      }
      // 기타 Provider인 경우
      else if (provider instanceof ethers.providers.Provider) {
        this.contract = new ethers.Contract(address, BONDING_CURVE_ABI, provider);
      }
      else {
        throw new Error('Invalid provider type');
      }
    } catch (error) {
      console.error('본딩커브 컨트랙트 초기화 실패:', error);
      throw error;
    }
  }

  connect(signer: ethers.Signer) {
    this.contract = this.contract?.connect(signer);
    return this;
  }

  get estimateGas() {
    return {
      buyTokens: async (amount: string) => {
        try {
          const amountWei = ethers.utils.parseEther(amount);
          const [estimatedAmount] = await this.contract.quoteAmountOut(amountWei, true);
          const minReceive = estimatedAmount.mul(95).div(100);
          const signer = await this.contract.signer.getAddress();
          
          return await this.contract.estimateGas.swapExactIn(
            amountWei,
            minReceive,
            true,
            signer,
            { value: amountWei }
          );
        } catch (error) {
          console.error('가스비 계산 실패 (buyTokens):', error);
          throw error;
        }
      },
      sellTokens: async (amount: string) => {
        try {
          const amountWei = ethers.utils.parseEther(amount);
          const [estimatedAmount] = await this.contract.quoteAmountOut(amountWei, false);
          const minReceive = estimatedAmount.mul(95).div(100);
          const signer = await this.contract.signer.getAddress();
          
          return await this.contract.estimateGas.swapExactIn(
            amountWei,
            minReceive,
            false,
            signer
          );
        } catch (error) {
          console.error('���스비 계산 실패 (sellTokens):', error);
          throw error;
        }
      }
    };
  }

  // 토큰 구매
  async buyTokens(etherAmount: string, options?: ethers.PayableOverrides) {
    try {
      if (!this.contract) {
        throw new Error('컨트랙트가 초기화되지 않았습니다');
      }
  
      // 거래 활성화 상태 확인 추가
      const isEnabled = await this.contract.tradingEnabled();
      console.log('거래 활성화 상태:', isEnabled);
      
      if (!isEnabled) {
        throw new Error('거래가 아직 활성화되지 않았습니다');
      }
  
      // value 값 수정
      const amountWei = ethers.utils.parseEther(etherAmount);
      const [estimatedAmount, requiredAmount, nativeFee] = await this.contract.quoteAmountOut(
        amountWei,
        true
      );
  
      const totalNeeded = requiredAmount.add(nativeFee);
      
      console.log('거래 정보:', {
        amountWei: ethers.utils.formatEther(amountWei),
        requiredAmount: ethers.utils.formatEther(requiredAmount),
        nativeFee: ethers.utils.formatEther(nativeFee),
        totalNeeded: ethers.utils.formatEther(totalNeeded)
      });
  
      const minReceive = estimatedAmount.mul(95).div(100);
      const signer = await this.contract.signer.getAddress();
  
      const tx = await this.contract.swapExactIn(
        amountWei,
        minReceive,
        true,
        signer,
        {
          value: totalNeeded, // amountWei 대신 totalNeeded 사용
          gasLimit: 500000,
          ...options
        }
      );
  
      console.log('트랜잭션 전송됨:', tx.hash);
      const receipt = await tx.wait();
      
      if (!receipt.status) {
        throw new Error('트랜잭션이 실패했습니다');
      }
  
      return receipt;
    } catch (error: any) {
      console.error('토큰 구매 실패:', error);
      
      // 에러 메시지 상세 분석
      if (error.error?.data?.message) {
        const reason = error.error.data.message;
        console.error('상세 에러 메시지:', reason);
        throw new Error(`트랜잭션 실패: ${reason}`);
      }
      throw error;
    }
  }

  // 토큰 판매
  async sellTokens(tokenAmount: string, options?: ethers.PayableOverrides) {
    try {
      if (!this.contract) {
        throw new Error('컨트랙트가 초기화되지 않았습니다');
      }
  
      const signer = await this.contract.signer.getAddress();
      const amountWei = ethers.utils.parseEther(tokenAmount);
  
      // 토큰 정보 가져오기
      const tokenInfo = await this.contract.tokenInfo();
      const tokenContract = new ethers.Contract(
        tokenInfo.token,
        ['function balanceOf(address) view returns (uint256)', 'function allowance(address,address) view returns (uint256)'],
        this.contract.provider
      );
  
      // approve 상태 확인
      const allowance = await tokenContract.allowance(signer, this.contract.address);
      if (allowance.lt(amountWei)) {
        console.log('토큰 승인 필요. approve 실행...');
        await this.approveTokens(tokenAmount);
      }
  
      // 판매 로직 실행
      const [estimatedAmount, requiredAmount, nativeFee] = await this.contract.quoteAmountOut(
        amountWei,
        false
      );
  
      console.log('판매 정보:', {
        판매수량: ethers.utils.formatEther(amountWei),
        예상수령액: ethers.utils.formatEther(estimatedAmount),
        필요수량: ethers.utils.formatEther(requiredAmount),
        수수료: ethers.utils.formatEther(nativeFee)
      });
  
      // 5. 최소 수령액 계산 (5% 슬리피지)
      const minReceive = estimatedAmount.mul(95).div(100);
  
      // 6. 트랜잭션 실행
      const tx = await this.contract.swapExactIn(
        amountWei,
        minReceive,
        false,
        signer,
        {
          gasLimit: 500000,
          ...options
        }
      );
  
      console.log('트랜잭션 전송됨:', tx.hash);
      const receipt = await tx.wait();
  
      if (!receipt.status) {
        throw new Error('트랜잭션이 실패했습니다');
      }
  
      return receipt;
    } catch (error: any) {
      console.error('토큰 판매 실패:', error);
      if (error.error?.data?.message) {
        const reason = error.error.data.message;
        console.error('상세 에러 메시지:', reason);
        throw new Error(`판매 실패: ${reason}`);
      }
      throw error;
    }
  }

  // 예상 거래 수량 계산
  async quoteSwapAmount(amount: string, isBuy: boolean) {
    try {
      const amountWei = ethers.utils.parseEther(amount);
      const [estimatedAmount, requiredAmount] = await this.contract.quoteAmountOut(
        amountWei,
        isBuy
      );
      
      return {
        estimatedAmount: ethers.utils.formatEther(estimatedAmount),
        requiredAmount: ethers.utils.formatEther(requiredAmount)
      };
    } catch (error) {
      console.error('예상 수량 계산 실패:', error);
      throw error;
    }
  }

  // 토큰 정보 조회
  async getTokenInfo() {
    try {
      const [token, reserveToken, reserveNative] = await this.contract.tokenInfo();
      return {
        tokenAddress: token,
        reserveToken: ethers.utils.formatEther(reserveToken),
        reserveNative: ethers.utils.formatEther(reserveNative)
      };
    } catch (error) {
      console.error('토큰 정보 조회 실패:', error);
      throw error;
    }
  }

  // 현재 토큰 가격 조회
  async getCurrentPrice(): Promise<string> {
    try {
      // 최소 단위(1 token)에 대한 가격 계산
      const oneToken = ethers.utils.parseEther('1');
      const [, requiredAmount] = await this.contract.quoteAmountOut(
        oneToken,
        true
      );
      
      return ethers.utils.formatEther(requiredAmount);
    } catch (error) {
      console.error('가격 조회 실패:', error);
      throw error;
    }
  }

  // 24시간 거래량 조회 (이벤트 기반)
  async get24HVolume(): Promise<string> {
    try {
      const provider = this.contract.provider;
      const currentBlock = await provider.getBlockNumber();
      const oneDayBlocks = 28800; // 약 24시간 (3초당 1블록 기준)
      
      const events = await this.contract.queryFilter(
        'Swap',
        currentBlock - oneDayBlocks,
        currentBlock
      );
      
      const volume = events.reduce((acc, event) => {
        const amountIn = ethers.BigNumber.from(event.args?.amountIn || 0);
        return acc.add(amountIn);
      }, ethers.BigNumber.from(0));
      
      return ethers.utils.formatEther(volume);
    } catch (error) {
      console.error('거래량 조회 실패:', error);
      throw error;
    }
  }

  // 가격 변동률 계산 (1시간)
  async getPriceChange(): Promise<number> {
    try {
      const provider = this.contract.provider;
      const currentBlock = await provider.getBlockNumber();
      const oneHourBlocks = 1200; // 약 1시간 (3초당 1블록 기준)
      
      // 현재 가격
      const currentPrice = await this.getCurrentPrice();
      
      // 1시간 전 블록의 이벤트 조회
      const pastEvents = await this.contract.queryFilter(
        'ReserveUpdate',
        currentBlock - oneHourBlocks,
        currentBlock - oneHourBlocks + 1
      );
      
      if (pastEvents.length === 0) {
        return 0;
      }
      
      // 과거 가격 계산
      const pastReserveNative = pastEvents[0].args?.reserveNative;
      const pastReserveToken = pastEvents[0].args?.reserveToken;
      const pastPrice = pastReserveNative.div(pastReserveToken);
      
      // 변동률 계산
      const priceChange = ((parseFloat(currentPrice) - parseFloat(ethers.utils.formatEther(pastPrice))) 
        / parseFloat(ethers.utils.formatEther(pastPrice))) * 100;
      
      return parseFloat(priceChange.toFixed(2));
    } catch (error) {
      console.error('가격 변동률 계산 실패:', error);
      return 0;
    }
  }

  // 예상 슬리피지 계산
  async calculateSlippage(amount: string, isBuy: boolean): Promise<number> {
    try {
      const amountWei = ethers.utils.parseEther(amount);
      const [estimatedAmount, requiredAmount] = await this.contract.quoteAmountOut(
        amountWei,
        isBuy
      );
      
      const currentPrice = await this.getCurrentPrice();
      const executionPrice = requiredAmount.div(estimatedAmount);
      
      const slippage = ((parseFloat(ethers.utils.formatEther(executionPrice)) - parseFloat(currentPrice))
        / parseFloat(currentPrice)) * 100;
      
      return parseFloat(slippage.toFixed(2));
    } catch (error) {
      console.error('슬리피지 계산 실패:', error);
      return 0;
    }
  }

  // approve 함수 추가
  async approveTokens(amount: string) {
    try {
      if (!this.contract) {
        throw new Error('컨트랙트가 초기화되지 않았습니다');
      }

      // 토큰 컨트랙트 정보 가져오기
      const tokenInfo = await this.contract.tokenInfo();
      const tokenContract = new ethers.Contract(
        tokenInfo.token,
        [
          'function approve(address spender, uint256 amount) returns (bool)',
          'function allowance(address owner, address spender) view returns (uint256)'
        ],
        this.contract.signer
      );

      const amountWei = ethers.utils.parseEther(amount);
      
      console.log('approve 실행:', {
        토큰주소: tokenInfo.token,
        승인대상: this.contract.address,
        승인수량: amount
      });

      // approve 트랜잭션 실행
      const tx = await tokenContract.approve(this.contract.address, amountWei);
      console.log('approve 트랜잭션 전송됨:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('approve 완료');
      
      return receipt;
    } catch (error) {
      console.error('토큰 승인 실패:', error);
      throw error;
    }
  }

  onSwap(listener: () => void) {
    this.contract.on('Swap', listener);
  }

  removeSwapListener(listener: () => void) {
    this.contract.off('Swap', listener);
  }
}