import { Component, createElement } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { bool, shape, number, arrayOf, string } from 'prop-types';

import { addItemToCart } from 'src/actions/cart';
import Page from 'src/components/Page';
import ProductFullDetail from 'src/components/ProductFullDetail';
import getUrlKey from 'src/util/getUrlKey';

class Product extends Component {
    static propTypes = {
        data: shape({
            productDetail: shape({
                total_count: number,
                items: arrayOf(
                    shape({
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
                        image: string,
                        image_label: string,
                        media_gallery_entries: arrayOf(
                            shape({
                                label: string,
                                position: number.isRequired,
                                disabled: bool,
                                file: string.isRequired
                            })
                        ),
                        description: string,
                        short_description: string,
                        canonical_url: string
                    })
                ).isRequired
            }).isRequired
        })
    };

    addToCart = async (item, quantity) => {
        const { guestCartId } = this.props;
        await this.props.addItemToCart({ guestCartId, item, quantity });
    };

    render() {
        return (
            <Page>
                <ProductFullDetail
                    addToCart={this.props.addItemToCart}
                    queryArguments={{ urlKey: getUrlKey }}
                />
            </Page>
        );
    }
}

const mapDispatchToProps = {
    addItemToCart
};

export default connect(
    null,
    mapDispatchToProps
)(Product);
