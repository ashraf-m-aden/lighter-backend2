module.exports = {
  apps: [
    {
      script: "app/index.js",
      watch: ".",
      instances: "max",
      env: {
        "NODE_ENV": "production",
        "PORT":process.env.PORT,
        "MONGODB_URL":
          process.env.MONGODB_URL,
        "jwt_secret":process.env.jwt_secret,
        "allowed_url":process.env.allowed_url,
        "host":process.env.host
        
      },
    },
  ],
};
