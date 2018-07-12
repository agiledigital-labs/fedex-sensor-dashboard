import { sagaMiddleware } from './store';
import { dataSagas } from './modules/data';

function run() {
  sagaMiddleware.run(dataSagas);
}

export default { run };
