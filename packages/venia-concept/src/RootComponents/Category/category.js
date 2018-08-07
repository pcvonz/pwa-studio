import { Component, createElement } from 'react';
import { string, number, shape } from 'prop-types';
import classify from 'src/classify';
import Page from 'src/components/Page';
import defaultClasses from './category.css';
import CategoryPageContent from 'src/components/CategoryPageContent';

class Category extends Component {
    static propTypes = {
        id: number,
        classes: shape({
            gallery: string,
            root: string,
            title: string
        })
    };

    render() {
        const { id, data, classes } = this.props;

        return (
          <Page>
            <CategoryPageContent id={id} data={data} classes={classes}> </CategoryPageContent>
          </Page>
        );
    }
}



export default classify(defaultClasses)(Category);
