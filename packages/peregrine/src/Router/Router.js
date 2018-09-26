import { createElement, Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { string, func } from 'prop-types';
import MagentoRouteHandler from './MagentoRouteHandler';

export default class MagentoRouter extends Component {
    static propTypes = {
        /* Can be BrowserRouter, MemoryRouter, HashRouter, etc */
        using: func,
        CustomLoader: func,
        NotFoundComponent: func,
        apiBase: string.isRequired,
        __tmp_webpack_public_path__: string.isRequired
    };

    static defaultProps = {
        using: BrowserRouter,
        routerProps: {}
    };

    /**
     * Given a URI, will always return the same URI with a trailing slash
     * @param {string} uri
     */
    ensureDirURI(uri) {
        return uri.endsWith('/') ? uri : uri + '/';
    }

    render() {
        const {
            using: Router,
            routerProps,
            apiBase,
            __tmp_webpack_public_path__,
            CustomLoader,
            NotFoundComponent
        } = this.props;

        return (
            <Router {...routerProps}>
                <Route
                    render={({ location }) => (
                        <MagentoRouteHandler
                            location={location}
                            apiBase={apiBase}
                            CustomLoader={CustomLoader}
                            NotFoundComponent={NotFoundComponent}
                            __tmp_webpack_public_path__={this.ensureDirURI(
                                __tmp_webpack_public_path__
                            )}
                        />
                    )}
                />
            </Router>
        );
    }
}
