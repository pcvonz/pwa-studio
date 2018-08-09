import { Component, createElement } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import { Price } from '@magento/peregrine';

import classify from 'src/classify';
import Button from 'src/components/Button';
import Carousel from 'src/components/ProductImageCarousel';
import Quantity from 'src/components/ProductQuantity';
import RichText from 'src/components/RichText';
import defaultClasses from './productFullDetail.css';
import wrapQuery from 'src/components/WrapQuery';
import gql from 'graphql-tag';

/**
 * As of this writing, there is no single Product query type in the M2.3 schema.
 * The recommended solution is to use filter criteria on a Products query.
 * However, the `id` argument is not supported. See
 * https://github.com/magento/graphql-ce/issues/86
 * TODO: Replace with a single product query when possible.
 */
const productDetailQuery = gql`
    query productDetail($urlKey: String) {
        productDetail: products(filter: { url_key: { eq: $urlKey } }) {
            items {
                sku
                name
                price {
                    regularPrice {
                        amount {
                            currency
                            value
                        }
                    }
                }
                description
                media_gallery_entries {
                    label
                    position
                    disabled
                    file
                }
            }
        }
    }
`;

class ProductFullDetail extends Component {
    static propTypes = {
        queryArgument: shape({
            urlKey: string
        }),
        classes: shape({
            actions: string,
            cartActions: string,
            description: string,
            descriptionTitle: string,
            details: string,
            detailsTitle: string,
            imageCarousel: string,
            productName: string,
            productPrice: string,
            quantity: string,
            quantityTitle: string,
            root: string,
            title: string
        }),
        data: shape({
            productDetail: shape({
                items: arrayOf(
                    shape({
                        product: shape({
                            id: number,
                            sku: string.isRequired,
                            price: shape({
                                regularPrice: shape({
                                    amount: shape({
                                        currency: string.isRequired,
                                        value: number.isRequired
                                    })
                                }).isRequired
                            }).isRequired,
                            media_gallery_entries: arrayOf(
                                shape({
                                    label: string,
                                    position: number,
                                    disabled: bool,
                                    file: string.isRequired
                                })
                            ),
                            description: string
                        }).isRequired,
                        addToCart: func.isRequired
                    })
                )
            })
        })
    };

    state = { quantity: 1 };

    setQuantity = quantity => this.setState({ quantity });

    addToCart = () => {
        this.props.addToCart({
            item: this.props.data.productDetail.items[0],
            quantity: this.state.quantity
        });
    };

    render() {
        const { classes } = this.props;
        const product = this.props.data.productDetail.items[0];
        const { regularPrice } = product.price;

        return (
            <article className={classes.root}>
                <section className={classes.title}>
                    <h1 className={classes.productName}>
                        <span>{product.name}</span>
                    </h1>
                    <p className={classes.productPrice}>
                        <Price
                            currencyCode={regularPrice.amount.currency}
                            value={regularPrice.amount.value}
                        />
                    </p>
                </section>
                <section className={classes.imageCarousel}>
                    <Carousel images={product.media_gallery_entries} />
                </section>
                <section className={classes.actions}>
                    <Button>
                        <span>Add to Wishlist</span>
                    </Button>
                </section>
                <section className={classes.quantity}>
                    <h2 className={classes.quantityTitle}>
                        <span>Quantity</span>
                    </h2>
                    <Quantity
                        value={this.state.quantity}
                        onChange={this.setQuantity}
                    />
                </section>
                <section className={classes.cartActions}>
                    <Button onClick={this.addToCart}>
                        <span>Add to Cart</span>
                    </Button>
                </section>
                <section className={classes.description}>
                    <h2 className={classes.descriptionTitle}>
                        <span>Product Description</span>
                    </h2>
                    <RichText content={product.description} />
                </section>
                <section className={classes.details}>
                    <h2 className={classes.detailsTitle}>
                        <span>SKU</span>
                    </h2>
                    <strong>{product.sku}</strong>
                </section>
            </article>
        );
    }
}

export default classify(defaultClasses)(
    wrapQuery(ProductFullDetail, productDetailQuery)
);
