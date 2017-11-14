/* eslint-disable */
import API from '../src/server/server';

const commentList = {
  "code": 0,
  "data": [{
      "faceUrl": "http://dlhr.oss-cn-hangzhou.aliyuncs.com/img/170120/bdd348729d37d079c6de86d88e98154a.jpeg",
      "name": "黄杰",
      "remainTime": "6天前",
      "uid": 10086
    }, {
      "faceUrl": "http://dlhr.oss-cn-hangzhou.aliyuncs.com/img/170120/bdd348729d37d079c6de86d88e98154a.jpeg",
      "name": "黄杰2",
      "remainTime": "4天前",
      "uid": 10087
    }
  ],
  "maxPage": 0,
  "msg": "",
  "page": 0,
  "pageSize": 15,
  "total": 1
};


export const comment = [
  {
    path: API.getCommentListUrl,
    data: commentList
  }
]