module.exports = {
    apps: [
        {
            name: 'zeplaobot-api',
            script: 'dist/index.js',
            cwd: __dirname,
            env_file: '.env',
            autorestart: true,
            restart_delay: 5000,
            max_restarts: 20,
            time: true,
        },
    ],
}