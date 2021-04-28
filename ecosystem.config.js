module.exports = {
    apps : [
    {
      name: 'User Microservice',
      script: 'user.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 5000
      }
    }
    ]
  };