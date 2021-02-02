import './middleware';
import { hasPermission } from './utils';
import permission from './permission';

export default (content, inject) => {
  const { store } = content;
  const storeModule = [{ name: 'permission', src: permission }];
  if (store) {
    storeModule.forEach((_store) => {
      store.registerModule(_store.name, _store.src, {
        preserveState: !!store.state[_store.name],
      });
    });
    content.$checkPermission = hasPermission.bind(null, content);
  }
  content.$checkPermission = hasPermission.bind(null, content);
  inject('checkPermission', hasPermission.bind(null, content));
};
