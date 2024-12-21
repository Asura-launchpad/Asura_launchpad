/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // TradingView 차트를 위해 StrictMode 비활성화
  eslint: {
    ignoreDuringBuilds: true, // 빌드 중 ESLint 에러 무시
  },
  webpack: (config) => {
    // TradingView 라이브러리 관련 설정
    config.module.rules.push({
      test: /\.js$/,
      include: /charting_library/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });

    return config;
  },
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
      fileName: true,
      topLevelImportPaths: [],
      meaninglessFileNames: ["index"],
      cssProp: true,
      namespace: "",
      minify: true,
      transpileTemplateLiterals: true,
      pure: true,
    },
  },
  images: {
    domains: [
      'overdiveback.s3.amazonaws.com',
      'publicoveridve.s3.amazonaws.com'
    ],
    unoptimized: true, // 이미지 최적화 비활성화 옵션 추가
    minimumCacheTTL: 60,
  }
}

module.exports = nextConfig