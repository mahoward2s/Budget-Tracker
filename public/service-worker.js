const APP_PREFIX = "my-site-cache-";
const VERSION = "v1";
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "data-cache-" + VERSION;


const FILES_TO_CACHE = [
    '/',
    './index.html',
    './css/style.css',
    './js/index.js',
    './js/indexedDB.js',
    './icons/icon-192X192.png',
    './icons/icon-512X512.png',
    './manifest.json',
  ];
  
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
  });
  
  // The activate handler takes care of cleaning up old caches.
/*   self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          const cacheList = cacheNames.filter((cacheName) => cacheName.indexOf(APP_PREFIX))
          cacheList.push(CACHE_NAME)
          return Promise.all(cacheNames.map((key,i)=> {
            if (cacheList.indexOf(key)===-1){
                return caches.delete(cacheNames[i])
            }
          }))
        })
    );
  });
   */
  self.addEventListener('fetch', (event) => {
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then((cache) => {
            return fetch(event.request).then((response) => {
               if (response.status === 200) {
                   cache.put(event.request.url, response.clone())
               } 
               return response
            })
        }).catch((err)=> {
            return cache.match(event.request)
        })
      );s
      return
    }
    event.respondWith(fetch(event.request).catch(()=>{
        return caches.match(event.request).then((response)=>{
        if (response) {
            return response
        } else if (event.request.headers.get("accept").includes("text/html")){
            return caches.match("/")
        }
        })
    }))
  });