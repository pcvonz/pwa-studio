import { Component, createElement } from 'react';
import { string, number, shape } from 'prop-types';
import gql from 'graphql-tag';
import classify from 'src/classify';
import Gallery from 'src/components/Gallery';
import Page from 'src/components/Page';
import defaultClasses from './category.css';
import wrapQuery from 'src/components/WrapQuery';

const categoryQuery = gql`
    query category($id: Int!) {
        category(id: $id) {
            description
            name
            product_count
            products {
                items {
                    id
                    name
                    small_image
                    price {
                        regularPrice {
                            amount {
                                value
                                currency
                            }
                        }
                    }
                }
            }
        }
    }
`;

class Category extends Component {
    static propTypes = {
        id: number,
        classes: shape({
            gallery: string,
            root: string,
            title: string
        })
    };

    // TODO: Should not be a default here, we just don't have
    // the wiring in place to map route info down the tree (yet)
    static defaultProps = {
        id: 3
    };

    render() {
        const { data, classes } = this.props;

        return (
          <Page>
            <article className={classes.root}>
              <h1 className={classes.title}>
                {/* TODO: Switch to RichContent component from Peregrine when merged */}
          <span
            dangerouslySetInnerHTML={{
              __html: data.category.description
            }}
          />
        </h1>
          <section className={classes.gallery}>
            <Gallery
              data={data.category.products.items}
              title={data.category.description}
            />
          </section>
          </article>
          </Page>
        );
    }
}



export default classify(defaultClasses)(wrapQuery(Category, categoryQuery));
