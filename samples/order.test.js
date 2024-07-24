// File: order.test.js
import { expect } from 'chai';
import { Order } from './order.js';

describe('Order Management System', () => {
    let order;

    beforeEach(() => {
        order = new Order('ORD123');
    });

    it('should add items to the order', () => {
        order.addItem({ id: 1, name: 'Item 1', price: 10, quantity: 2 });
        expect(order.items.length).to.equal(1);
    });

    it('should remove items from the order', () => {
        order.addItem({ id: 1, name: 'Item 1', price: 10, quantity: 2 });
        order.removeItem(1);
        expect(order.items.length).to.equal(0);
    });

    it('should calculate the total price of the order', () => {
        order.addItem({ id: 1, name: 'Item 1', price: 10, quantity: 2 });
        order.addItem({ id: 2, name: 'Item 2', price: 5, quantity: 1 });
        const total = order.calculateTotal();
        expect(total).to.equal(25);
    });

    it('should apply discounts based on the discount code', () => {
        order.addItem({ id: 1, name: 'Item 1', price: 100, quantity: 1 });
        const discountedTotal = order.applyDiscount('BLACKFRIDAY');
        expect(discountedTotal).to.equal(50);
    });

    it('should generate a detailed invoice', () => {
        order.addItem({ id: 1, name: 'Item 1', price: 10, quantity: 2 });
        const invoice = order.generateInvoice();
        expect(invoice).to.contain('Invoice for Order ID: ORD123');
        expect(invoice).to.contain('Item 1 (2 x $10.00) = $20.00');
        expect(invoice).to.contain('Total: $20.00');
    });
});
