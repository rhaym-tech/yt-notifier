import { join } from 'path';
import { EventEmitter } from 'events';
import RSSParser from 'rss-parser';
import { LocalStorage } from 'node-localstorage';

interface Video {
  id: string;
  url: string | undefined;
  channelName: string;
}

const rssParser = new RSSParser(); // Create an instance of RSSParser

class VideoNotifier extends EventEmitter {
  private storage: LocalStorage;

  constructor(options: { channel: string; checkInterval?: number }) {
    super();
    if (!options.channel || options.channel === '') {
      throw new Error('Invalid or empty channel');
    }
    if (!options.checkInterval) {
      options.checkInterval = 60;
    }

    if (typeof options.checkInterval !== 'number') {
      throw new Error('Check interval must be a number');
    } else if (options.checkInterval < 30) {
      console.warn('Warning: Short check intervals may cause issues.');
    }

    this.storage = new LocalStorage(join(__dirname, 'video-storage'));

    rssParser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${options.channel}`)
      .then((response) => {
        const videoId = response.items[0].id.replace('yt:video:', '');
        this.storage.setItem(videoId, videoId);
      })
      .catch((err) => {
        if (err.message === 'Status code 404') {
          return console.warn(`Channel not found. Channel ID: ${options.channel}`);
        }
        console.error(err);
      });

    setInterval(() => {
      rssParser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${options.channel}`)
  .then((response) => {
    if (!response.items || response.items.length === 0) {
      console.warn('No video items found in the RSS feed.');
      return;
    }

    const item = response.items[0];
    const videoInfo: any = {};
    videoInfo.channelName = item.author || 'Unknown Author';
    videoInfo.url = item.link || 'No Link Available';
    videoInfo.id = item.id ? item.id.replace('yt:video:', '') : 'No ID Available';

    // Rest of your code
  })
  .catch((err) => {
    console.error('Error parsing the RSS feed:', err);
  });

    }, options.checkInterval * 1000);
  }
}

export default VideoNotifier;
