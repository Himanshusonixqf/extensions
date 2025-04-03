import { useEffect, useState } from 'react';
import {
  useApi,
  reactExtension,
  Image,
  Grid,
  Text,
  View,
  Button,
  useCartLines,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.cart-line-list.render-after',
  () => <Upsell />,
);

function Upsell() {
  const [data, setData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);  
  const [loadingButtons, setLoadingButtons] = useState({}); 
  const { query, applyCartLinesChange } = useApi();
  const cartLines = useCartLines();

  useEffect(() => {
   
    
    setIsFetching(true);
    query(
      `query {
        shop {
          name
        }
        collectionByHandle(handle: "automated-collection") {
          title
          id
          products(first: 3) {
            nodes {
              id
              variants(first: 1) {
                nodes {
                  id
                  image {
                    url
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
              title
            }
          }
        }
      }`
    )
      .then(({ data, errors }) => {
        if (errors) {
          
          return;
        }

 
        const cartProductIds = cartLines.map((line) => {
          
          return line.merchandise.product.id;
        });
   

        const filteredProducts = {
          ...data,
          collectionByHandle: {
            ...data.collectionByHandle,
            products: {
              ...data.collectionByHandle.products,
              nodes: data.collectionByHandle.products.nodes.filter((product) => {
                const isInCart = cartProductIds.includes(product.id);
                
                return !isInCart;
              }),
            },
          },
        };
 
        setData(filteredProducts);
      })
      .catch((error) => console.error('Query failed:', error))
      .finally(() => setIsFetching(false));
  }, [query, cartLines]);

  const handleAddToCart = async (variantId) => {
    try {
      setLoadingButtons((prev) => ({ ...prev, [variantId]: true }));
      const result = await applyCartLinesChange({
        type: 'addCartLine',
        merchandiseId: variantId,
        quantity: 1,
      });

      if (result.type === 'error') {
        console.error('Failed to add to cart:', result.message);
      } else {
        console.log('Successfully added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  if (isFetching && !data) {
    return <Text>Loading products...</Text>;
  }

  if (!data?.collectionByHandle?.products?.nodes.length) {
    return <Text>No upsell products available</Text>;
  }

  return (
    <Grid columns={['33%', '33%', '33%']} rows={['auto']} spacing="loose">
      {data.collectionByHandle.products.nodes.map((node) => {
        const variant = node.variants.nodes[0];
        return (
          <View border="base" padding="base" key={node.id}>
            <Image source={variant.image.url} />
            <Text emphasis="bold">{node.title}</Text>
            <View>
              {variant.price.amount} {variant.price.currencyCode}
            </View>
            <Button
              inlineAlignment="center"
              loading={loadingButtons[variant.id] || false}  
              onPress={() => handleAddToCart(variant.id)}
            >
              Add to Cart
            </Button>
          </View>
        );
      })}
    </Grid>
  );
}