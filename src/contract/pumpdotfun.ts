import { Connection, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

interface PumpFunTokenOptions {
  twitter?: string;
  telegram?: string;
  website?: string;
  initialLiquiditySOL?: number;
  slippageBps?: number;
  priorityFee?: number;
}

interface TradeQuoteResponse {
  estimatedAmount: number;
  priceImpact: number;
  fee: number;
}

export class PumpDotFun {
  private connection: Connection;

  constructor(endpoint?: string) {
    this.connection = new Connection(
      endpoint || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
    );
  }

  async getTradeQuote(
    mint: string,
    action: 'buy' | 'sell',
    amount: number,
    denominatedInSol: boolean = true
  ): Promise<TradeQuoteResponse> {
    const response = await fetch('https://pumpportal.fun/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mint,
        action,
        amount,
        denominatedInSol
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get quote: ${response.statusText}`);
    }

    return await response.json();
  }

  async createTradeTransaction(
    publicKey: string,
    mint: string,
    action: 'buy' | 'sell',
    amount: number,
    options: {
      denominatedInSol?: boolean;
      slippage?: number;
      priorityFee?: number;
      pool?: 'pump' | 'raydium';
    } = {}
  ): Promise<VersionedTransaction> {
    const response = await fetch('https://pumpportal.fun/api/trade-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey,
        action,
        mint,
        denominatedInSol: options.denominatedInSol ?? true,
        amount,
        slippage: options.slippage ?? 5,
        priorityFee: options.priorityFee ?? 0.00001,
        pool: options.pool ?? 'pump'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create transaction: ${response.statusText}`);
    }

    const data = await response.arrayBuffer();
    return VersionedTransaction.deserialize(new Uint8Array(data));
  }

  async getTokenBalance(mint: string, publicKey: string): Promise<number> {
    const response = await fetch(`https://pumpportal.fun/api/balance/${mint}/${publicKey}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get balance: ${response.statusText}`);
    }

    const { balance } = await response.json();
    return balance;
  }

  async getTokenInfo(mint: string) {
    try {
      const tokenInfo = await this.connection.getParsedAccountInfo(new PublicKey(mint));
      if (!tokenInfo || !tokenInfo.value) {
        throw new Error('토큰 정보를 찾을 수 없습니다');
      }

      const data = tokenInfo.value.data;
      return {
        currentSupply: (data as any).parsed?.info?.supply || 0,
        maxSupply: (data as any).parsed?.info?.maxSupply || 800000000,
        decimals: (data as any).parsed?.info?.decimals || 9
      };
    } catch (error) {
      console.error('토큰 정보 조회 실패:', error);
      return {
        currentSupply: 0,
        maxSupply: 800000000,
        decimals: 9
      };
    }
  }

  async sendTransaction(tx: VersionedTransaction): Promise<string> {
    const signature = await this.connection.sendRawTransaction(tx.serialize());
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  async launchToken(
    publicKey: string,
    name: string,
    ticker: string,
    description: string,
    profileImageUrl: string,
    options: {
      twitter: string;
      telegram: string;
      website: string;
      initialLiquiditySOL: number;
      slippageBps: number;
      priorityFee: number;
    }
  ): Promise<{ mint: string; signature: string }> {
    // 1. 먼타데이터 생성
    const formData = new FormData();

    // 이미지 처리 로깅 추가
    if (profileImageUrl) {
      try {
        console.log('프로필 이미지 URL 처리 시작:', profileImageUrl);
        const imageResponse = await fetch(profileImageUrl);
        
        if (!imageResponse.ok) {
          throw new Error(`이미지 fetch 실패: ${imageResponse.status} ${imageResponse.statusText}`);
        }
        
        const blob = await imageResponse.blob();
        console.log('이미지 blob 생성 완료:', {
          size: blob.size,
          type: blob.type
        });
        
        formData.append("file", blob);
      } catch (error) {
        console.error('이미지 처리 실패:', {
          url: profileImageUrl,
          error: error instanceof Error ? error.message : String(error)
        });
        throw new Error('프로필 이미지 처리 중 오류가 발생했습니다');
      }
    }

    // 메타데이터 요청 로깅
    console.log('IPFS 메타데이터 요청:', {
      name,
      symbol: ticker,
      description,
      twitter: options.twitter,
      telegram: options.telegram,
      website: options.website,
      hasFile: !!profileImageUrl
    });

    // IPFS API 호출
    let metadataResponseJSON;
    try {
      const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Origin': 'https://pump.fun'
        },
        body: formData
      });

      // 응답 상세 로깅
      console.log('IPFS 응답 헤더:', {
        status: metadataResponse.status,
        statusText: metadataResponse.statusText,
        headers: Object.fromEntries(metadataResponse.headers.entries())
      });

      if (!metadataResponse.ok) {
        const errorText = await metadataResponse.text();
        console.error('IPFS 메타데이터 생성 실패:', {
          status: metadataResponse.status,
          statusText: metadataResponse.statusText,
          headers: Object.fromEntries(metadataResponse.headers.entries()),
          errorBody: errorText
        });
        throw new Error(`메타데이터 생성 실패: ${metadataResponse.status} ${metadataResponse.statusText}`);
      }

      try {
        metadataResponseJSON = await metadataResponse.json();
        console.log('IPFS 메타데이터 응답:', metadataResponseJSON);

        if (!metadataResponseJSON?.metadataUri) {
          throw new Error('메타데이터 URI가 없습니다');
        }
      } catch (error) {
        console.error('IPFS 응답 파싱 실패:', {
          error: error instanceof Error ? error.message : String(error),
          responseText: await metadataResponse.text()
        });
        throw new Error('메타데이터 응답 형식이 잘못되었습니다');
      }
    } catch (error) {
      console.error('IPFS 처리 중 오류:', {
        error: error instanceof Error ? error.message : String(error),
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: value instanceof Blob ? 'Blob' : typeof value,
          size: value instanceof Blob ? value.size : String(value).length
        }))
      });
      throw new Error('IPFS 메타데이터 처리 중 오류가 발생했습니다');
    }

    // 2. 토큰 생성 트랜잭션 요청
    const mintKeypair = Keypair.generate();
    const response = await fetch('https://pumpportal.fun/api/trade-local', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey,
        action: "create",
        tokenMetadata: {
          name: metadataResponseJSON.metadata.name,
          symbol: metadataResponseJSON.metadata.symbol,
          uri: metadataResponseJSON.metadataUri
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: true,
        amount: options.initialLiquiditySOL,
        slippage: options.slippageBps / 100,
        priorityFee: options.priorityFee,
        pool: "pump"
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create token: ${response.statusText}`);
    }

    const txData = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(txData));
    tx.sign([mintKeypair]);  // 민트 키페어로 서명

    const signature = await this.sendTransaction(tx);
    
    return {
      mint: mintKeypair.publicKey.toBase58(),
      signature
    };
  }

//   async launchTokenBundle(
//     signerPublicKeys: string[],
//     name: string,
//     ticker: string,
//     description: string,
//     profileImageUrl: string,
//     options: {
//       twitter: string;
//       telegram: string;
//       website: string;
//       initialAmount: number;
//       buyAmount: number;
//       slippage: number;
//       priorityFee: number;
//     }
//   ): Promise<{ mint: string; signatures: string[] }> {
//     // 데이터 검증
//     if (!name || !ticker || !description) {
//       throw new Error('필수 메타데이터 필드가 누락되었습니다');
//     }

//     const formData = new FormData();

//     // 메타데이터 필드는 한 번만 추가
//     formData.append("name", name);
//     formData.append("symbol", ticker);
//     formData.append("description", description);
//     formData.append("twitter", options.twitter || "");
//     formData.append("telegram", options.telegram || "");
//     formData.append("website", options.website || "");
//     formData.append("showName", "true");

//     // 이미지 처리
//     if (profileImageUrl) {
//       try {
//         const imageResponse = await fetch(profileImageUrl);
//         if (!imageResponse.ok) {
//           throw new Error(`이미지 fetch 실패: ${imageResponse.status}`);
//         }
//         const blob = await imageResponse.blob();
//         formData.append("files", blob, "image.png");  // 'files' 키로 변경
//       } catch (error) {
//         console.error('이미지 처리 실패:', error);
//         throw new Error('프로필 이미지 처리 중 오류가 발생했습니다');
//       }
//     }

//     // 메타데이터는 'data' 키로 추가
//     const metadata = {
//       name,
//       symbol: ticker,
//       description,
//       twitter: options.twitter || "",
//       telegram: options.telegram || "",
//       website: options.website || "",
//       showName: true
//     };
    
//     formData.append("data", JSON.stringify(metadata));  // 'data' 키로 JSON 추가

//     // FormData 내용 로깅
//     console.log('FormData 내용:', {
//       entries: Array.from(formData.entries()).map(([key, value]) => ({
//         key,
//         type: value instanceof Blob ? 'Blob' : typeof value,
//         size: value instanceof Blob ? value.size : String(value).length
//       }))
//     });

//     // IPFS API 호출
//     const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
//       method: "POST",
//       body: formData
//     });

//     if (!metadataResponse.ok) {
//       const errorText = await metadataResponse.text();
//       console.error('Metadata response:', {
//         status: metadataResponse.status,
//         statusText: metadataResponse.statusText,
//         headers: Object.fromEntries(metadataResponse.headers.entries()),
//         body: errorText
//       });
//       throw new Error(`Failed to create metadata: ${metadataResponse.status} ${metadataResponse.statusText}`);
//     }
    
//     let metadataResponseJSON;
//     try {
//       metadataResponseJSON = await metadataResponse.json();
//       console.log('Metadata response JSON:', metadataResponseJSON);  // 응답 로깅
//     } catch (error) {
//       console.error('Failed to parse metadata response:', error);
//       throw new Error('Invalid metadata response format');
//     }

//     // 2. 민트 키페어 생성
//     const mintKeypair = Keypair.generate();

//     // 3. 번들 트랜잭션 생성
//     const bundledTxArgs = [
//       {
//         publicKey: signerPublicKeys[0],
//         action: "create",
//         tokenMetadata: {
//           name,
//           symbol: ticker,
//           uri: metadataResponseJSON?.metadataUri || ''
//         },
//         mint: mintKeypair.publicKey.toBase58(),
//         denominatedInSol: false,
//         amount: options.initialAmount,
//         slippage: options.slippage,
//         priorityFee: options.priorityFee,
//         pool: "pump"
//       },
//       {
//         publicKey: signerPublicKeys[1],
//         action: "buy",
//         mint: mintKeypair.publicKey.toBase58(),
//         denominatedInSol: false,
//         amount: options.buyAmount,
//         slippage: options.slippage,
//         priorityFee: options.priorityFee / 2,
//         pool: "pump"
//       }
//     ];

//     const response = await fetch('https://pumpportal.fun/api/trade-local', {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(bundledTxArgs)
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to create bundle: ${response.statusText}`);
//     }

//     const transactions = await response.json();
//     const encodedSignedTransactions = [];
//     const signatures = [];

//     // 4. 트랜잭션 서명
//     for (let i = 0; i < transactions.length; i++) {
//       const tx = VersionedTransaction.deserialize(new Uint8Array(bs58.decode(transactions[i])));
//       if (bundledTxArgs[i].action === "create") {
//         tx.sign([mintKeypair]);
//       }
//       encodedSignedTransactions.push(bs58.encode(tx.serialize()));
//       signatures.push(bs58.encode(tx.signatures[0]));
//     }

//     // 5. Jito MEV-보호 번들 전송
//     try {
//       await fetch('https://mainnet.block-engine.jito.wtf/api/v1/bundles', {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           jsonrpc: "2.0",
//           id: 1,
//           method: "sendBundle",
//           params: [encodedSignedTransactions]
//         })
//       });
//     } catch (error) {
//       console.error('Failed to send bundle to Jito:', error);
//     }

//     return {
//       mint: mintKeypair.publicKey.toBase58(),
//       signatures
//     };
//   }
// }

// // 싱글톤 인스턴스 성
// export const pumpDotFun = new PumpDotFun();
async launchTokenBundle(
    signerPublicKeys: string[],
    name: string,
    ticker: string,
    description: string,
    profileImageUrl: string,
    options: {
      twitter: string;
      telegram: string;
      website: string;
      initialAmount: number;
      buyAmount: number;
      slippage: number;
      priorityFee: number;
    }
  ): Promise<{ mint: string; signatures: string[] }> {
    // 1. 메타데이터 생성
    const formData = new FormData();
    
    // 이미지 처리
    if (profileImageUrl) {
      const imageResponse = await fetch(profileImageUrl);
      const blob = await imageResponse.blob();
      formData.append("file", blob);
    }
  
    // 메타데이터 필드 추가
    formData.append("name", name);
    formData.append("symbol", ticker);
    formData.append("description", description);
    formData.append("twitter", options.twitter || "");
    formData.append("telegram", options.telegram || "");
    formData.append("website", options.website || "");
    formData.append("showName", "true");
  
    // IPFS 업로드
    const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData
    });
  
    const metadataResponseJSON = await metadataResponse.json();
  
    // 2. 민트 키페어 생성
    const mintKeypair = Keypair.generate();
  
    // 3. 번들 트랜잭션 생성
    const bundledTxArgs = [
      {
        publicKey: signerPublicKeys[0],
        action: "create",
        tokenMetadata: {
          name,
          symbol: ticker,
          uri: metadataResponseJSON.metadataUri
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: false,
        amount: options.initialAmount,
        slippage: options.slippage,
        priorityFee: options.priorityFee,
        pool: "pump"
      },
      {
        publicKey: signerPublicKeys[1],
        action: "buy",
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: false,
        amount: options.buyAmount,
        slippage: options.slippage,
        priorityFee: options.priorityFee / 2,
        pool: "pump"
      }
    ];
  
    const response = await fetch('https://pumpportal.fun/api/trade-local', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bundledTxArgs)
    });
  
    const transactions = await response.json();
    const encodedSignedTransactions = [];
    const signatures = [];
  
    for (let i = 0; i < transactions.length; i++) {
      const tx = VersionedTransaction.deserialize(new Uint8Array(bs58.decode(transactions[i])));
      if (bundledTxArgs[i].action === "create") {
        tx.sign([mintKeypair]);
      }
      encodedSignedTransactions.push(bs58.encode(tx.serialize()));
      signatures.push(bs58.encode(tx.signatures[0]));
    }
  
    // Jito MEV-보호 번들 전송
    await fetch('https://mainnet.block-engine.jito.wtf/api/v1/bundles', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sendBundle",
        params: [encodedSignedTransactions]
      })
    });
  
    return {
      mint: mintKeypair.publicKey.toBase58(),
      signatures
    };
  }
}
export const pumpDotFun = new PumpDotFun();
