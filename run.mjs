import { createServer } from 'vite';

async function start() {
  const server = await createServer({
    configFile: './vite.config.ts',
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
  });
  await server.listen();
  console.log('VITE_READY: http://localhost:5173');
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
