import React, { createElement } from 'react';
import ReactDOM from 'react-dom';
import bootstrap from '@magento/peregrine';
import { MagentoRouter } from '@magento/peregrine';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import Loader from 'src/components/Loader';
import NotFound from 'src/components/NotFound';

import reducer from 'src/reducers/app';
import './index.css';

const routerProps = {
  apiBase: new URL('/graphql', location.origin).toString(),
  __tmp_webpack_public_path__: __webpack_public_path__,
  customLoader: <Loader />,
  four: <NotFound />
};

const customRouter = <MagentoRouter {...routerProps} />;

const { Provider, store } = bootstrap({
  customRouter: customRouter
});

store.addReducer('app', reducer);

const apolloClient = new ApolloClient();

ReactDOM.render(
    <ApolloProvider client={apolloClient}>
        <Provider />
    </ApolloProvider>,
    document.getElementById('root')
);

if (process.env.SERVICE_WORKER && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register(process.env.SERVICE_WORKER)
            .then(registration => {
                console.log('Service worker registered: ', registration);
            })
            .catch(error => {
                console.log('Service worker registration failed: ', error);
            });
    });
}

export { store };
