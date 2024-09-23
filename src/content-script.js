const nav = (chrome || browser)
const storage = nav.storage
const runtime = nav.runtime
const configPromise = storage.sync.get(['autolinkConfig'])

let taskManagerUrlPattern = ""
let referenceRegex = undefined

const replaceWithLinks = (element) => {
  const originalText = element.innerHTML;
  const newText = originalText.replace(referenceRegex, (match, taskId) => {
    const taskUrl = `${taskManagerUrlPattern}${taskId}`;
    return `<a href="${taskUrl}" target="_blank">${match}</a>`;
  });

  if (newText !== originalText) {
    element.innerHTML = newText;
  }
}

const splitLink = (linkElement) => {

  const linkText = linkElement.innerHTML;
  const attributesDict = {}
  for (let attr of linkElement.attributes) {
    attributesDict[attr.name] = attr.value;
  }
  const attrStr = Object.entries(attributesDict)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');


  const replacedText = linkText.split(referenceRegex).filter(item => !!item).map((text, index) => {
    if (index % 2 === 1) {
      return `<a href="${taskManagerUrlPattern}${text}" target="_blank" class="${attributesDict.class}"> #${text}</a>`;
    } else {
      return `<a ${attrStr}>${text}</a>`;
    }
  }).join('');

  linkElement.outerHTML = replacedText
}

const autoRefEl = el => {
  if (el) {
    el.tagName === 'A' ? splitLink(el) : replaceWithLinks(el)
  }
}
const autoRefSelectorAll = selector => document.querySelectorAll(selector).forEach(autoRefEl);

const handleSingleCommitPage = autoRefSelectorAll.bind(null, '.extended-commit-description-container div, .extended-commit-description-container:not(:has(div)), [data-component="PH_Title"] > .markdown-title')
const handleCommitListPage = autoRefSelectorAll.bind(null, ".commit-message, .commit-title")
const handleCommitsListPage = autoRefSelectorAll.bind(null, "h4.markdown-title > span > a")
const handlePRListPage = autoRefSelectorAll.bind(null, ".Link--primary.markdown-title")
const handlePRCommitListPage = autoRefSelectorAll.bind(null, '[href*="/commits/"][title]')
const handlePRConversationPage = autoRefSelectorAll.bind(null, '.Link--secondary.markdown-title')
const handleAnyPRPage = autoRefSelectorAll.bind(null, '.gh-header-title > .markdown-title, [data-component="PH_Title"] > .markdown-title, .js-issue-title.markdown-title.Link--primary')

let old_url = ''

const isConsideredProjectUrl = async url => {
  const config = await configPromise
  const projects = config?.autolinkConfig?.projects
  if (!(projects instanceof Array))
    return

  const regexPattern = new RegExp(`^https://github\\.com/(${projects.join('|')})/.+`);
  return regexPattern.test(url)
}

const linkInsertionForUrl = async url => {
  const config = await configPromise

  taskManagerUrlPattern = config.autolinkConfig.taskManagerUrlPattern
  referenceRegex = new RegExp(config.autolinkConfig.referenceRegex);

  if (url.includes("/pull/")) {
    handleAnyPRPage()
    if (/.*\/pull\/\d+$/.test(url))
      handlePRConversationPage()
    else if (url.includes("/commits/"))
      handleCommitListPage();
    else if (url.includes("/commits"))
      handlePRCommitListPage();
  } 
  else if (url.includes("/pulls"))
      handlePRListPage();
  else if (url.includes("/commit/"))
    handleSingleCommitPage();
  else if (url.includes("/commits/"))
    handleCommitsListPage();
}

const didUrlChanged = url => {
  if (old_url == url)
    return false
  old_url = url
  return true
}

const insertLinks = async () => {
  const url = window.location.href;
  if (didUrlChanged(url) && await isConsideredProjectUrl(url))
    linkInsertionForUrl(url)
}

const insertLinksDelayed = () => setTimeout(insertLinks, 300);


insertLinks()

runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'url_changed') {
    insertLinksDelayed()
  }
});
