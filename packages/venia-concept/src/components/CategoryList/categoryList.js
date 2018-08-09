import { Component, createElement } from 'react';
import { string, number, shape } from 'prop-types';
import gql from 'graphql-tag';
import classify from 'src/classify';
import defaultClasses from './categoryList.css';
import wrapQuery from 'src/components/WrapQuery';

// TODO: get only active categories from graphql when it is ready
const categoryListQuery = gql`
    query category($id: Int!) {
        category(id: $id) {
            children {
                name
                url_key
                url_path
                image
            }
        }
    }
`;

// TODO: get categoryUrlSuffix from graphql when it is ready
const categoryUrlSuffix = '.html';

class CategoryList extends Component {
    static propTypes = {
      queryArgument: shape({
        id: number
      }),
        title: string,
        classes: shape({
            root: string,
            header: string,
            content: string,
            title: string,
            item: string,
            imageWrapper: string,
            image: string,
            name: string
        })
    };

    render() {
      const { classes, data } = this.props;

      if (data.category.children == '')
        return <div>Here are not any child categories</div>;

      return (
        <div className={classes.content}>
          {data.category.children.map((item, index) => (
            <a
              className={classes.item}
              href={`/${
            item.url_key
          }${categoryUrlSuffix}`}
          key={index}
        >
          <span className={classes.imageWrapper}>
            {item.image && (
              <img
                className={classes.image}
                src={`/pub/media/catalog/category/${
                  item.image
                                                    }`}
                                                    alt={item.name}
                                                  />
            )}
          </span>
          <span className={classes.name}>
            {item.name}
          </span>
        </a>
          ))}
        </div>
      );
    }
}

export default classify(defaultClasses)(wrapQuery(CategoryList, categoryListQuery));
