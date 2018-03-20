/**
 * 返回一个  Selection 对象，表示用户选择的文本范围或光标的当前位置。
 * @returns {Selection}
 */
function getSelection() {
  return window.getSelection();
}

export function removeAllRanges() {
  const selection = getSelection();
  selection.removeAllRanges();
}

function findSameTagNameByRange(utils, tagName) {
  let util;
  for (let i = 0, l = utils.length; i < l; i += 1) {
    util = utils[i];
    if (!util.inactive && util.el && util.el.indexOf(tagName) !== -1) {
      util.active = true;
      return;
    }
  }
}

export function getStatusByRange(utils) {
  const selection = getSelection();
  console.log(selection);
  const range = selection.getRangeAt(0);
  let parentElement = range.startContainer.parentNode;
  let tagName;
  while ((parentElement.tagName && (tagName = parentElement.tagName.toUpperCase())) && tagName !== 'DIV') {
    findSameTagNameByRange(utils, tagName);
    parentElement = parentElement.parentNode;
  }
  console.log(utils);
}
