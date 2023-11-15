self.addEventListener("install", async event => {
	const cache = await caches.open("emojimix");
	self.skipWaiting();
	cache.delete("/emojimix/offline.html");
	cache.add("/emojimix/offline.html");
	console.log("emojimix service worker installed");
});

self.addEventListener("activate", () => {
	self.clients.claim();
	console.log("emojimix service worker activated");
});

self.addEventListener("fetch", async event => {
	let handler = async () => {
		const cache = await caches.open("emojimix");
		let response;
		try {
			response = await fetch(event.request);
		} catch(error) {
			console.log("emojimix no connection");
			response = await cache.match("/emojimix/offline.html");
		}
		return response;
	}
	event.respondWith(handler());
});