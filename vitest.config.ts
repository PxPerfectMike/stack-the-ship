import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts']
	},
	resolve: {
		alias: {
			$engine: fileURLToPath(new URL('./src/lib/engine', import.meta.url)),
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	}
});
