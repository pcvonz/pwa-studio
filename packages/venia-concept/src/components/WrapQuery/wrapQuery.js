import React, { Component, createElement } from 'react';
import { Query } from 'react-apollo';

export default function wrapQuery(WrappedComponent, query) {
    return class QueryHOC extends Component {
        render() {
            const queryArguments = this.props.queryArguments;
            const props = this.props;
            return (
                <Query query={query} variables={{ ...queryArguments }}>
                    {({ loading, error, data }) => {
                        if (error) return <div>Data Fetch Error</div>;
                        if (loading) return <p>Fetching data...</p>;
                        return <WrappedComponent {...props} data={data} />;
                    }}
                </Query>
            );
        }
    };
}
