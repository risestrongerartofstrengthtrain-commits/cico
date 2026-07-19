/* CICO by Rise Stronger — offline
   Κρατά την εφαρμογή στη μνήμη ώστε να ανοίγει και χωρίς ίντερνετ.
   Στρατηγική: δίκτυο πρώτα (για να παίρνεις πάντα τη νέα έκδοση),
   με πτώση στη μνήμη όταν δεν υπάρχει σύνδεση. */
const CACHE='cico-v1';
const ASSETS=['./','./index.html'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==self.location.origin)return;   // Supabase κ.λπ. πάντα από το δίκτυο
  e.respondWith(
    fetch(r).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html')))
  );
});
