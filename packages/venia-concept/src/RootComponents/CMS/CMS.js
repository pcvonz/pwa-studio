import { createElement, Component } from 'react';
import Page from 'src/components/Page';
import CategoryList from 'src/components/CategoryList';
import CategoryHeader from 'src/components/CategoryHeader';

export default class CMS extends Component {
    render() {
        return (
            <Page>
                <CategoryHeader title="Shop by category" />
                <CategoryList queryArguments={{ id: 2 }} />
            </Page>
        );
    }
}
