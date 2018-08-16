import { createElement, Component } from 'react';
import Page from 'src/components/Page';
import CategoryList from 'src/components/CategoryList';
import Search from 'src/components/Search';
import { debounce } from 'underscore';

export default class CMS extends Component {
    constructor() {
        super();
        this.state = {
            searchTerm: 'Apple'
        };
    }

    handleChange = debounce((searchTerm) => {
        console.log(searchTerm);
        this.setState({
            searchTerm: searchTerm
        });
    }, 400)

    render() {
        return (
            <Page>
                <input onChange={
                    (evt) => {
                        this.handleChange(evt.target.value);
                    }
                } />
                <Search search={this.state.searchTerm} />
                <CategoryList title="Shop by category" id={2} />
            </Page>
        );
    }
}
