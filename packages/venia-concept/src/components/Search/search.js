import { Component, createElement } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import classify from 'src/classify';
import defaultClasses from './search.css';

const searchQuery = gql`
query products($search: String) {
  products(search: $search) {
    items {
      id
      name
    }
  }
}
`;


class Search extends Component {

    render() {
        const { search } = this.props;
        console.log(search);
        return (
            <Query query={searchQuery} variables={{search}}>
                {({ loading, error, data }) => {
                    if (error) return <div>Data Fetch Error</div>;
                    if (loading) return <div>Fetching Data</div>;
                    if (data.products.items.length == 0) return <div> No results </div>
                    console.log(data);

                    return (
                        <div>
                            {
                                data.products.items.map((item) => {
                                return <li key={item.id}>{ item.name } </li>
                                })
                            }
                        </div>
                    );
                }}
            </Query>
        );
    }
}

export default classify(defaultClasses)(Search);
