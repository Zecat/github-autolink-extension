const storage = chrome.storage || browser.storage;

const fixMissConfig = (result) => {
  if (!(result instanceof Object))
    result = {}
  let conf = result.autolinkConfig
  if (!(conf instanceof Object))
    conf = {}
  let { projects, taskManagerUrlPattern, referenceRegex } = conf
  if (!(typeof taskManagerUrlPattern == 'string'))
    taskManagerUrlPattern = ''
  if (!(typeof referenceRegex == 'string'))
    referenceRegex = ''
  if (!(projects instanceof Array))
    projects = []
  projects = projects.filter(p => typeof p == 'string')
  validConf = {
    projects, taskManagerUrlPattern, referenceRegex
  }
  if (JSON.stringify(result.autolinkConfig) !== JSON.stringify(validConf))
    storage.sync.set({ autolinkConfig: validConf });

  return validConf
}

document.addEventListener('DOMContentLoaded', function () {
  const referenceRegexEl = document.getElementById('referenceRegex');
  const taskManagerUrlPatternEl = document.getElementById('taskManagerUrlPattern');
  const chipsEl = document.getElementById('chips');

  let chipInitialized = false

  const onChipInput = () => {
    if (!chipInitialized)
      return
    updateConfigFromInputs()
  }

  const chipsInstance = M.Chips.init(chipsEl, {
    placeholder: 'username/projectname',
    onChipAdd: onChipInput,
    onChipDelete: onChipInput
  })

  storage.sync.get(['autolinkConfig'], function (result) {
    const { projects, taskManagerUrlPattern, referenceRegex } = fixMissConfig(result)
    chipsData = projects.map(p => ({ tag: p }))
    chipsData.forEach(d => chipsInstance.addChip(d))
    referenceRegexEl.value = referenceRegex
    taskManagerUrlPatternEl.value = taskManagerUrlPattern
    M.updateTextFields(); // Update label state of materializecss
    chipInitialized = true;
  });

  const getConfigFromInputs = () => ({
    referenceRegex: referenceRegexEl.value,
    taskManagerUrlPattern: taskManagerUrlPatternEl.value,
    projects: chipsInstance.chipsData.map(chip => chip.tag)
  })

  const updateConfigFromInputs = () => storage.sync.set({ autolinkConfig: getConfigFromInputs() });

  referenceRegexEl.addEventListener('input', updateConfigFromInputs);
  taskManagerUrlPatternEl.addEventListener('input', updateConfigFromInputs);
});
