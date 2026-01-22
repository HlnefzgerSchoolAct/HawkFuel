const workboxBuild = require('workbox-build');

// NOTE: Run this after `npm run build` to generate a production service worker
const buildSw = () => {
  return workboxBuild.generateSW({
    globDirectory: 'build',
    globPatterns: [
      '**/*.{html,js,css,png,svg,ico,json}'
    ],
    swDest: 'build/service-worker.js',
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
        },
      },
    ],
  });
};

buildSw().then(({count, size, warnings}) => {
  warnings.forEach(console.warn);
  console.log(`Generated service-worker.js, which will precache ${count} files, totaling ${size} bytes.`);
}).catch((err) => {
  console.error('Unable to generate service worker:', err);
});
