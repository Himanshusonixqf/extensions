import {
  reactExtension,
  BlockStack,
  InlineLayout,
  Text,
  View,
  Progress,
  Link,
  Style,
  useBuyerJourneyActiveStep,
  useCartLines,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';
 
export default reactExtension(
  'purchase.checkout.header.render-after',
  () => <ProgressBarExtension />,
);

function ProgressBarExtension() {
  const stepData = useBuyerJourneyActiveStep();
  const { handle } = stepData || { handle: 'shipping' };

  const cartLines = useCartLines();  
  const [currentStep, setCurrentStep] = useState('cart');
 
  useEffect(() => {
    if (handle) {
      setCurrentStep(handle);
    }
  }, [handle]);
 
  const defaultSteps = ['cart', 'information', 'shipping', 'payment'];
  const stepNames = {
    cart: 'Cart',
    information: 'Information',
    shipping: 'Shipping',
    payment: 'Payment',
  };

 
  const requiresShipping = cartLines.some((line) => line.merchandise.requiresShipping);
  const availableSteps = requiresShipping
    ? defaultSteps
    : defaultSteps.filter((step) => step !== 'shipping');
  const totalSteps = availableSteps.length;

 
  const getProgress = () => {
    const currentIndex = availableSteps.indexOf(currentStep);
    
    
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / totalSteps) * 100;
  };

  const progress = getProgress();

  const columnWidth = `${100 / totalSteps}%`;
  const columns = availableSteps.map(() => columnWidth);
 
 
  return (
    <BlockStack padding="base" border="base" spacing="tight">
      <Text size="medium" emphasis="bold">
        Checkout Progress
      </Text>
      <InlineLayout columns={columns} spacing="base">
        {availableSteps.map((stepHandle) => (
          <Step
            key={stepHandle}
            name={stepNames[stepHandle] || stepHandle}
            link={
              stepHandle === 'cart' && currentStep !== 'cart'
                ? 'https://team-gamma-checkout-extension.myshopify.com/cart'
                : stepHandle === 'information' && currentStep !== 'information'
                ? '/information'
                : stepHandle === 'shipping' && currentStep === 'payment'
                ? '/shipping'
                : null
            }
            active={currentStep === stepHandle}
            padding={Style.default('base').when({ hover: true }, 'loose')}
            border={Style.default('none').when({ hover: true }, '1px solid #000')}
          />
        ))}
      </InlineLayout>
      <View border="base" padding="tight">
        <Progress accessibilityLabel="Checkout Step" value={progress} max={100} />
      </View>
      <Text size="small">Progress: {Math.round(progress)}%</Text>
    </BlockStack>
  );
}
 
function Step({ name, active, border, link, padding }) {
  return (
    <View
      background={active ? 'subdued' : 'transparent'}
      padding={padding || Style.default('base').when({ hover: true }, 'loose')}
      border={border || 'none'}
      inlineAlignment="center"
    >
      {link ? (
        <Link to={link}>
          <Text emphasis="bold">{name}</Text>
        </Link>
      ) : (
        <Text emphasis={active ? 'bold' : 'regular'}>{name}</Text>
      )}
    </View>
  );
}