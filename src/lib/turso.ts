import { createClient } from '@libsql/client';

const turso = createClient({
  url: 'libsql://orderpote-hidecatd.aws-ap-northeast-1.turso.io',
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN,
});

export default turso;
