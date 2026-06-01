import { defineConfig } from 'orval';

export default defineConfig({
  petstore: {
    input: '../../docs/api/openapi-schema.yaml',
    output: './src/api/generated/',
  },
});