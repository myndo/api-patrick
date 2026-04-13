/* eslint-disable prettier/prettier */
/**
 * PM2 Ecosystem Configuration
 *
 * Usage:
 *   pm2 start ecosystem.config.js          → start all apps
 *   pm2 start ecosystem.config.js --only tradedoubler-worker  → start worker only
 *   pm2 logs tradedoubler-worker            → tail worker logs
 *
 */
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'tradedoubler-worker',
      script: 'dist/src/workers/tradedoubler-job.worker.js',
      autorestart: false,
      watch: false,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        TD_WORKER_ENABLED: 'true',
        TD_WORKER_POLL_MS: 1000,
      },
    },
    {
      name: 'rtbhouse-worker',
      script: 'dist/src/workers/rtbhouse-job.worker.js',
      autorestart: false,
      watch: false,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        RTB_WORKER_ENABLED: 'true',
        RTB_WORKER_POLL_MS: 1000,
      },
    },
  ],
};
