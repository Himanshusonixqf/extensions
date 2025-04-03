import {
  reactExtension,
  TextField,
  useApplyCartLinesChange,
  useCartLines,
  useCartLineTarget,
  Text,
  BlockStack,
  InlineLayout,
  Stepper
} from '@shopify/ui-extensions-react/checkout';

import { useState } from "react";

export default reactExtension(
  'purchase.checkout.cart-line-item.render-after',
  () => <Extension />,
);

function Extension() {
  const line = useCartLineTarget();  
 
  
  const applyCartLineChange = useApplyCartLinesChange();  
  const [quantities, setQuantities] = useState({});  
 
  const handleQuantityChange = async (lineId, newQuantity) => {
    setQuantities(newQuantity);
  console.log(newQuantity,"dataof changes");
  
    await applyCartLineChange({
      type: "updateCartLine",
      id: lineId,  
      quantity: parseInt(newQuantity),  
    });
  };

  return (
    < >
      <Text>Self quntity </Text>
    <BlockStack spacing="loose">
      
        <InlineLayout key={line.id} columns={["fill", "auto"]} spacing="base">
          
          <Stepper
            label="Quantity"
            type="number"
            value={ line.quantity}
            onChange={(v)=>handleQuantityChange(line.id , v) }
          />
        </InlineLayout>
      
    </BlockStack> 
    </ >
  );
}
