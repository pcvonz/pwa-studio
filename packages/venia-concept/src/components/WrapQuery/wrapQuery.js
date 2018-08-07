import React, { Component, createElement } from 'react';
import { Query } from 'react-apollo';

export default function wrapQuery(WrappedComponent, categoryQuery) {
  return class QueryHOC extends Component {
    render() {
      const { id, classes } = this.props;
      return (
        <Query query={categoryQuery} variables={{ id }}>
          {({ loading, error, data }) => {
            if (error) return <div>Data Fetch Error</div>;
            if (loading) return <p>Fetching data...</p>;
            return ( <WrappedComponent data={data} classes={classes}></WrappedComponent>)
          }}
        </Query>
      )
    }
  }
}
