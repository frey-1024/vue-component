// http://nightwatchjs.org/guide#usage;
const util = require('../lib/util');
module.exports = {
  'default e2e tests': function (browser) {
    const devServer = util.getFullUrl(browser,'activityEntry', {
      activityId:31,
      familyId:70,
      uid:111,
      token:'2222'
    });
    console.log(devServer);
    browser
      .url(devServer)
      .waitForElementVisible('#app', 1000)
      .assert.elementPresent('.entry-wrapper')
      .assert.containsText('.entry-title', '活动报名')
      .setValue('input[placeholder=参与人姓名]', '')
      .setValue('input[placeholder=联系电话]', '18322831749')
      .setValue('input[placeholder=请输入公司名称]', '苹果')
      .setValue('input[placeholder=请输入职位]', '研发')
      .setValue('input[placeholder=出席人数]', '2')
      .setValue('textarea[placeholder=备注]', '我给你闹着玩的吗')
      .pause(1000)
      .click('.entry-submit')
      .assert.elementPresent('.toast-wrapper')
      .assert.containsText('.toast-wrapper .content','请把内容填写完整')
      .pause(2000)

      .setValue('input[placeholder=参与人姓名]', '张坤123456708934534543453534534534534534534235235423')
      .click('.entry-submit')
      .assert.elementPresent('.toast-wrapper')
      .assert.containsText('.toast-wrapper .content', '参与人姓名不能超过20字')

      .pause(3000)
      .assert.elementNotPresent('.toast-wrapper')

      .clearValue('input[placeholder=参与人姓名]')
      .setValue('input[placeholder=参与人姓名]', '张坤')
      .pause(1000)
      .click('.entry-submit')
      .perform(function(client, done) {
        done();
      })
      .pause(500)
      .assert.elementPresent('.toast-wrapper')
      .assert.containsText('.toast-wrapper .content', 'token不存在或无效的token')
      .end()
  }
};
