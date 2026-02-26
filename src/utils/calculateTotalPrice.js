export default function calculateTotalPrice(price, quantity) {
    // Check if parameters are valid numbers and greater than zero
    if (typeof price !== 'number' || typeof quantity !== 'number' || price <= 0 || quantity <= 0) {
        return 'Please enter a valid price and quantity (numbers greater than zero).';
    }

    // Calculate the total price
    const totalPrice = price * quantity;

    // Return the total price
    return totalPrice;
}