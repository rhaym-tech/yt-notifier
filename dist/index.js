"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const events_1 = require("events");
const rss_parser_1 = __importDefault(require("rss-parser"));
const node_localstorage_1 = require("node-localstorage");
const rssParser = new rss_parser_1.default(); // Create an instance of RSSParser
class VideoNotifier extends events_1.EventEmitter {
    constructor(options) {
        super();
        if (!options.channel || options.channel === '') {
            throw new Error('Invalid or empty channel');
        }
        if (!options.checkInterval) {
            options.checkInterval = 60;
        }
        if (typeof options.checkInterval !== 'number') {
            throw new Error('Check interval must be a number');
        }
        else if (options.checkInterval < 30) {
            console.warn('Warning: Short check intervals may cause issues.');
        }
        this.storage = new node_localstorage_1.LocalStorage((0, path_1.join)(__dirname, 'video-storage'));
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
                const item = response.items[0];
                const videoInfo = {};
                videoInfo.channelName = item.author;
                // videoInfo.title = item.title;
                // videoInfo.publishDate = `${item.pubDate.split('T')[0]} ${item.pubDate.split('T')[1].replace('.000Z', '')}`;
                videoInfo.url = item.link;
                videoInfo.id = item.id.replace('yt:video:', '');
                if (this.storage.getItem(videoInfo.id)) {
                    return;
                }
                this.storage.setItem(videoInfo.id, videoInfo.id);
                this.emit('newVideo', videoInfo);
            })
                .catch((err) => {
                if (err.message === 'Status code 404') {
                    return console.warn(`Channel not found. Channel ID: ${options.channel}`);
                }
                console.error(err);
            });
        }, options.checkInterval * 1000);
    }
}
exports.default = VideoNotifier;
