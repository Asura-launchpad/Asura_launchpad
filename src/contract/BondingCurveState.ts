import { ethers } from 'ethers';
import { BondingCurveContract } from './bondingCurve';

export class BondingCurveState {
  private readonly TOTAL_SUPPLY = ethers.utils.parseEther('1000000000'); // 10억
  private readonly BONDING_CURVE_SUPPLY = ethers.utils.parseEther('800000000'); // 8억
  private readonly RESERVED_SUPPLY = ethers.utils.parseEther('000000000'); // 2억

  constructor(private readonly contract: BondingCurveContract) {}
  async getBondingCurveProgress() {
    try {
      const tokenInfo = await this.contract.getTokenInfo();
      const currentBalance = ethers.utils.parseEther(tokenInfo.reserveToken);
      
      // 판매된 수량 = 본딩커브 유통량(8억) - 현재 컨트랙트 보유량
      const soldAmount = this.BONDING_CURVE_SUPPLY.sub(currentBalance);
      
      console.log('본딩커브 상태:', {
        토탈서플라이: ethers.utils.formatEther(this.TOTAL_SUPPLY),
        본딩커브유통량: ethers.utils.formatEther(this.BONDING_CURVE_SUPPLY),
        컨트랙트보유량: tokenInfo.reserveToken,
        판매된수량: ethers.utils.formatEther(soldAmount)
      });
      
      return {
        progress: Number(ethers.utils.formatEther(soldAmount)),
        total: Number(ethers.utils.formatEther(this.BONDING_CURVE_SUPPLY))
      };
    } catch (error) {
      console.error('본딩커브 진행률 조회 실패:', error);
      return {
        progress: 0,
        total: Number(ethers.utils.formatEther(this.BONDING_CURVE_SUPPLY))
      };
    }
  }
}