import Mock from 'mockjs';

import { comment } from './mock.comment';

function addToMock(list) {
  list.forEach((n) => {
    Mock.mock(n.path, n.data);
  });
}

addToMock(comment);

export default Mock;
