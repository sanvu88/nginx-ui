import { URL, fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import vueJsx from '@vitejs/plugin-vue-jsx'

import vitePluginBuildId from 'vite-plugin-build-id'
import svgLoader from 'vite-svg-loader'
import AutoImport from 'unplugin-auto-import/vite'
import DefineOptions from 'unplugin-vue-define-options/vite'

function fixAntdvWarningPlugin() {
  return {
    name: 'fix-antd-vue-warning', //
    transform(code: string, id: string) {
      // replace antdv js only
      if (id.includes('ant-design-vue/es/_util/hooks/_vueuse')) {
        // replace /* #__PURE__ */ with empty string
        const newCode = code.replace(/\/\* #__PURE__ \*\//g, '')

        return {
          code: newCode,
          map: null,
        }
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // eslint-disable-next-line n/prefer-global/process
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      extensions: [
        '.mjs',
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.vue',
        '.less',
      ],
    },
    plugins: [
      fixAntdvWarningPlugin(),

      vue(),
      vueJsx(),

      vitePluginBuildId(),
      svgLoader(),
      Components({
        resolvers: [AntDesignVueResolver({ importStyle: false })],
        directoryAsNamespace: true,
      }),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        vueTemplate: true,
      }),
      DefineOptions(),
    ],
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'border-radius-base': '5px',
          },
          javascriptEnabled: true,
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:9000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
  }
})
