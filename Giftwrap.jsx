import { 
    reactExtension,
    useApplyCartLinesChange,
    Checkbox,
    useCartLineTarget,
    BlockSpacer,
    BlockStack,
    InlineLayout
} from '@shopify/ui-extensions-react/checkout';
import { useState, useEffect } from "react";

export default reactExtension(
    'purchase.checkout.cart-line-item.render-after',
    () => <Extension />,
);

function Extension() {
    const line = useCartLineTarget();
    console.log(line,"line");
    
    const applyCartLineChange = useApplyCartLinesChange();
    
    const giftWrapAttr = line.attributes.find(attr => attr.key === "giftWrap")?.value;
    const initialGiftWrapState = giftWrapAttr === "true"; 
 
 
    const requiresShipping = line.merchandise.requiresShipping;
    
    const [isGiftWrapped, setIsGiftWrapped] = useState(initialGiftWrapState);

    useEffect(() => { 
       
        setIsGiftWrapped(initialGiftWrapState);
    }, [giftWrapAttr]);  

    const handleGiftWrap = async (checked) => {
        setIsGiftWrapped(checked);

        const currentQuantity = line?.quantity || 1;
 
        const updatedAttributes = line.attributes.filter(attr => attr.key !== "giftWrap");

        if (checked) {
            updatedAttributes.push({ key: "giftWrap", value: "true" });
        }

        try {
            await applyCartLineChange({
                type: "updateCartLine",
                id: line.id,
                quantity: currentQuantity,
                merchandiseId: line.merchandise.id,
                attributes: updatedAttributes 
            });
            console.log(line,"line");

        } catch (error) {
            console.error("Error updating gift wrap:", error);
        }
    };

    return (
        requiresShipping ? (
            <BlockStack>
                <BlockSpacer spacing="none" />
                <Checkbox 
                    name="gift"
                    checked={isGiftWrapped}  
                    onChange={handleGiftWrap}
                >
                    Gift wrap
                </Checkbox>
            </BlockStack>
        ) : null
    );
}
