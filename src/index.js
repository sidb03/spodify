import React from 'react'
import ReactDOM from 'react-dom'
import App from './app/App'
import { Provider } from 'unstated';

import { templateContainer } from './app/containers/TemplateContainer';
import { dataContainer } from './app/containers/DataContainer';

ReactDOM.render(
  <Provider inject={[templateContainer, dataContainer]}>
    <App />
  </Provider>,
  document.getElementById('root')
);
