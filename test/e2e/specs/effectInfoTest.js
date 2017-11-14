// http://nightwatchjs.org/guide#usage;
const util = require('../lib/util');
module.exports = {
  'default e2e tests': function (browser) {
    const devServer = util.getFullUrl(browser,'effectInfo', {
      uid:17889,
      token:'c360ff0b1924ee931fb13968e6cb8d93'
    });
    console.log(devServer);
    browser
      .url(devServer)
      .waitForElementVisible('#app', 1000)
      .assert.elementPresent('.wrapper')
      .assert.containsText('.header-title', '影响力')
      .end()
  }
};
