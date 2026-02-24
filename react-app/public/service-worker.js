self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = data.title || 'Notification';
    const options = {
      body: data.body || '',
      icon: '/logo192.png', // optional: change to your app's icon
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/') // Change URL as needed
    );
  });
  