/**
 * Created by administrato on 2017/7/28.
 */
module.exports =  {
  getFullUrl: (browser, fileName, params) => {
    let packageParams = '';
    if (params) {
      Object.keys(params).forEach(function (key, i) {
        if (i === 0) {
          packageParams += '?';
        } else {
          packageParams += '&';
        }
        packageParams += key + '=' + params[key];
      });
    }
    return `${browser.globals.devServerURL}/${fileName}.html${packageParams}`
  }
};
