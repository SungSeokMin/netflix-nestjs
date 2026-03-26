/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as winston from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

// 개발환경용 포맷 (보기 좋게)
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }), // 에러 스택 출력
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr} ${stack ?? ''}`;
  }),
);

// 운영환경용 포맷 (JSON, 로그 수집기 친화적)
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const isProd = process.env.NODE_ENV === 'production';

export const winstonConfig: winston.LoggerOptions = {
  level: isProd ? 'info' : 'debug', // 운영: info 이상만 / 개발: debug 전체
  format: isProd ? prodFormat : devFormat,
  transports: [
    // 공통: 콘솔 출력
    new winston.transports.Console(),

    // 운영환경만: 파일 저장
    ...(isProd
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 20 * 1024 * 1024, // 20MB
            maxFiles: 14, // 14개 보관 후 순환
            zippedArchive: true,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 20 * 1024 * 1024,
            maxFiles: 14,
            zippedArchive: true,
          }),
        ]
      : []),
  ],
  // 핸들링 안 된 예외/Promise 거부도 로깅
  exceptionHandlers: isProd
    ? [new winston.transports.File({ filename: 'logs/exceptions.log' })]
    : [new winston.transports.Console()],
  rejectionHandlers: isProd
    ? [new winston.transports.File({ filename: 'logs/rejections.log' })]
    : [new winston.transports.Console()],
};
