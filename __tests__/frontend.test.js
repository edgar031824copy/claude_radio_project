/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

const ELEMENT_IDS = [
  'playBtn', 'iconPlay', 'iconPause', 'status', 'visualizer', 'volume', 'elapsed',
  'npTitle', 'npArtist', 'npAlbum', 'npQuality', 'npYear', 'albumArt',
  'historyList', 'ratingsRow', 'btnUp', 'btnDown', 'countUp', 'countDown',
];

beforeAll(() => {
  document.body.innerHTML = ELEMENT_IDS.map(id =>
    id === 'albumArt' ? `<img id="${id}" />` : `<div id="${id}"></div>`
  ).join('');

  global.Audio = jest.fn(() => ({
    play: jest.fn().mockResolvedValue(),
    pause: jest.fn(),
    addEventListener: jest.fn(),
    canPlayType: jest.fn().mockReturnValue(''),
  }));

  global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({ title: 'Test', artist: 'Artist', album: '', date: '' }),
  });

  global.Hls = Object.assign(
    jest.fn(() => ({ loadSource: jest.fn(), attachMedia: jest.fn(), on: jest.fn() })),
    { isSupported: jest.fn().mockReturnValue(false), Events: { ERROR: 'hlserror' } }
  );

  const code = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
  eval(code); // eslint-disable-line no-eval
});

describe('DOM elements', () => {
  it('all required elements exist', () => {
    ELEMENT_IDS.forEach(id => {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  it('play button is present and clickable', () => {
    const btn = document.getElementById('playBtn');
    expect(btn).not.toBeNull();
    expect(() => btn.click()).not.toThrow();
  });

  it('vote buttons exist', () => {
    expect(document.getElementById('btnUp')).not.toBeNull();
    expect(document.getElementById('btnDown')).not.toBeNull();
  });
});

describe('fetchMetadata on load', () => {
  it('fetch was called at least once on init', () => {
    expect(global.fetch).toHaveBeenCalled();
  });

  it('fetch called with metadata URL', () => {
    const calls = global.fetch.mock.calls.map(c => c[0]);
    expect(calls.some(url => url.includes('metadatav2.json'))).toBe(true);
  });
});
