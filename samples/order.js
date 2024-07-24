// File: order.js
class Order {
    constructor(orderId) {
        this.orderId = orderId;
        this.items = [];
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
    }

    calculateTotal() {
        return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    applyDiscount(discountCode) {
        let discount = 0;
        switch (discountCode) {
            case 'BLACKFRIDAY':
                discount = 0.5; // 50% discount
                break;
            case 'SUMMERSALE':
                discount = 0.2; // 20% discount
                break;
            case 'WELCOME':
                discount = 0.1; // 10% discount
                break;
            default:
                discount = 0;
                break;
        }
        return this.calculateTotal() * (1 - discount);
    }

    generateInvoice() {
        let invoice = `Invoice for Order ID: ${this.orderId}\n`;
        invoice += '---------------------------------\n';
        this.items.forEach(item => {
            invoice += `${item.name} (${item.quantity} x $${item.price.toFixed(2)}) = $${(item.price * item.quantity).toFixed(2)}\n`;
        });
        invoice += '---------------------------------\n';
        invoice += `Total: $${this.calculateTotal().toFixed(2)}\n`;
        return invoice;
    }
}

export { Order };
