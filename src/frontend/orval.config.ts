import { defineConfig } from 'orval';

export default defineConfig({
  flatflow: {
    input: '../../docs/api/openapi-schema.yaml',
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      client: 'fetch',
      override: {
        mutator: {
          path: './src/api/fetcher.ts',
          name: 'customFetch',
        },
      },
    },
  },
});
