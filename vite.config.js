
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    host: true,
    port: 5000
  },
  resolve: {
    alias: {
      '@assets': path.resolve('./attached_assets')
    }
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunks to split large dependencies
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
          'vendor-wagmi': ['wagmi', '@rainbow-me/rainbowkit', 'viem'],
          'vendor-ui': ['lucide-react', 'framer-motion'],
          
          // Large specific libraries
          'pdfjs': ['pdfjs-dist'],
          'tensorflow': ['@tensorflow/tfjs', '@tensorflow-models/universal-sentence-encoder'],
          'd3-tree': ['react-d3-tree'],
          'query-client': ['@tanstack/react-query'],
          
          // Language and localization
          'language-detection': ['franc'],
          
          // Other large utilities
          'leaflet': ['leaflet', 'react-leaflet'],
          'dropzone': ['react-dropzone'],
          'axios': ['axios']
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            path.basename(chunkInfo.facadeModuleId, path.extname(chunkInfo.facadeModuleId)) : 
            'unknown';
          return `js/[name]-[hash].js`;
        }
      }
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@tensorflow/tfjs', 'pdfjs-dist']
    },
    // Source maps only in development
    sourcemap: process.env.NODE_ENV === 'development',
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    }
  }
})
