// 文本行距, 下拉选取原数据
const lineHeightMenus = [{
  name: '单倍行距',
  val: 1,
  active: false,
}, {
  name: '1.5倍行距',
  val: 1.5,
  active: true,
}, {
  name: '2倍行距',
  val: 2,
  active: false,
}, {
  name: '2.5倍行距',
  val: 2.5,
  active: false,
}, {
  name: '3倍行距',
  val: 3,
  active: false,
}];

/**
 * 工具图标列表原数据
 */
export default [
  { name: 'source', active: false, separator: true },
  { name: 'undo', active: false, inactive: true, },
  { name: 'redo', active: false, inactive: true, separator: true },
  { name: 'bold', active: false, el: ['B', 'STRONG'] },
  { name: 'italic', active: false, el: ['I', 'EM'] },
  { name: 'underline', active: false, el: ['U'] },
  { name: 'strikethrough', active: false, el: ['S', 'STRIKE'] },
  { name: 'lineheight', active: false, menus: lineHeightMenus, style: { left: 0, width: '120px', height: '130px', top: '25px', fontSize: '12px' } },
  { name: 'removeformat', active: false, separator: true }
];
