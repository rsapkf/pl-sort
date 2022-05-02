const appUrl = `https://pl-sort.netlify.app/`;
const examplePlaylist = 'PLlaN88a7y2_q16UdiTcsWnr0gFIcDMhHX';

const parsePlaylistId = (link) => {
  let id = link.split('list=').pop().split('&')[0];
  if (!id.startsWith('PL')) return examplePlaylist;
  return id;
};

// Open playlist in pl-sort when icon is clicked
browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.create({
    url: `${appUrl}?id=${parsePlaylistId(tab.url)}`,
  });
});

// Add context menu item to playlist links
const viewInPlsortLinkId = 'view-in-pl-sort-link';
browser.contextMenus.create({
  id: viewInPlsortLinkId,
  title: 'View playlist in pl-sort',
  contexts: ['link'],
  targetUrlPatterns: [
    '*://*.youtube.com/playlist?list=*',
    '*://*.youtube.com/watch?v=*&list=*',
  ],
});

browser.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === viewInPlsortLinkId) {
    browser.tabs.create({
      url: `${appUrl}?id=${parsePlaylistId(info.linkUrl)}`,
    });
  }
});

// Add context item to playlist pages
const viewInPlsortMenuPageId = 'view-in-pl-sort-page';
browser.contextMenus.create({
  id: viewInPlsortMenuPageId,
  title: 'View playlist in pl-sort',
  contexts: ['page'],
  documentUrlPatterns: [
    '*://*.youtube.com/playlist?list=*',
    '*://*.youtube.com/watch?v=*&list=*',
  ],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === viewInPlsortMenuPageId) {
    browser.tabs.create({
      url: `${appUrl}?id=${parsePlaylistId(tab.url)}`,
    });
  }
});
