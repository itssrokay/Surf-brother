import { defineConfig } from 'vite';
import { cmsPlugin } from './cms-plugin.js';

export default defineConfig({ plugins: [cmsPlugin()] });
