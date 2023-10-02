const VideoNotifier = require("./src/index").default // Adjust the import path as needed

// Replace 'YOUR_CHANNEL_ID' with the actual YouTube channel ID you want to monitor
const channelToMonitor = '';

const notifier = new VideoNotifier({ channel: channelToMonitor, checkInterval: 30 });

notifier.on('newVideo', (video) => {
  console.log(`New video published by ${video.channelName}`);
  console.log(`Video URL: ${video.url}`);
  console.log(`Video ID: ${video.id}`);
});

console.log(`Listening for new videos on channel: ${channelToMonitor}`);

// Keep the script running to continue listening
