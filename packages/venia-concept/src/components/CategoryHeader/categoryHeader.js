import { createElement, Component, Fragment } from 'react';
import defaultClasses from './categoryHeader.css';
export default class CategoryHeader extends Component {
    static defaultProps = {
      classes: defaultClasses
    };

    get header() {
        const { title, classes } = this.props;

        return title ? (
            <div className={classes.header}>
                <h2 className={classes.title}>
                    <span>{title}</span>
                </h2>
            </div>
        ) : null;
    }


    render() {
        return (
          <Fragment>
            {this.header}
          </Fragment>
        );
    }
}
