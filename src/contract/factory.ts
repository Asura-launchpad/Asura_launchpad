import { ethers } from 'ethers';
import { FACTORY_ADDRESS } from './address';
import FACTORY_ABI from '../abi/factory_abi.json';

// 본딩커브 프로젝트를 생성하는 팩토리 클래스
export class ProjectFactory {
  // 팩토리 컨트랙트 인스턴스
  private contract: ethers.Contract;

  // 초기 스왑 금액 상수
  private static INITIAL_SWAP_AMOUNT = "0.001"; // 0.001 ETH for initial liquidity

  // Web3 프로바이더를 받아 컨트랙트 인스턴스를 초기화
  constructor(providerOrSigner: ethers.providers.Web3Provider | ethers.Signer) {
    const signer = 'getSigner' in providerOrSigner 
      ? providerOrSigner.getSigner() 
      : providerOrSigner;
    this.contract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
  }

  // createLaunchpad 메서드로 변경
  async createLaunchpad(
    name: string,
    symbol: string,
    tokenUri: string,
    amount: number,
    amountIsOut: boolean = false
  ) {
    try {
      const signer = this.contract.signer;
      const creator = await signer.getAddress();

      // 토큰 데이터 구성
      const tokenData = {
        name,
        symbol,
        tokenUri,
        creator
      };

      // 초기 구매 금액 계산
      const initialBuyAmount = ethers.utils.parseEther("0.001");  // 0.01 ETH
      const fee = await this.contract.swapFee();  // 수수료 비율 가져오기
      const BASIS_POINTS = await this.contract.BASIS_POINTS();
      const feeAmount = initialBuyAmount.mul(fee).div(BASIS_POINTS);
      const totalAmount = initialBuyAmount.add(feeAmount);

      console.log('Transaction Parameters:', {
        initialBuyAmount: ethers.utils.formatEther(initialBuyAmount),
        fee: ethers.utils.formatEther(feeAmount),
        total: ethers.utils.formatEther(totalAmount),
        tokenData
      });

      const tx = await this.contract.createLaunchpad(
        initialBuyAmount,
        amountIsOut,
        tokenData,
        { 
          value: totalAmount,
          gasLimit: 3000000
        }
      );
      
      console.log('Transaction Hash:', tx.hash);
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (e: any) => e.event === 'BondingCurveCreated'
      );
      
      const result = {
        bondingCurveAddress: event?.args?.bondingCurve, // 본딩커브 컨트랙트 주소
        tokenAddress: event?.args?.token, // 토큰 컨트랙트 주소
        totalSupply: event?.args?.totalSupply, // 총 발행량
        saleAmount: event?.args?.saleAmount, // 판매량
        endMarketCap: event?.args?.endMarketCap, // 최종 시가총액
        initMarketCap: event?.args?.initMarketCap, // 초기 시가총액
        txHash: receipt.transactionHash // 트랜잭션 해시
      };

      console.log('Transaction Success:', result);
      
      return result;
    } catch (error) {
      console.error('Transaction Failed:', error);
      throw error;
    }
  }
}