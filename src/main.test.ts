import { describe, expect, test, vi } from 'vitest';
import request from 'supertest';
import * as OrderModule from './Pizza/application/orderPizza.js';
import * as PayModule from './Pizza/application/payForOrder.js';
import * as DeliveryModule from './Pizza/application/sendDelivery.js';
import { orderPizza } from './Pizza/application/orderPizza.js';
import { getOrderById, orderFactory, readNextOrderId } from './Pizza/repositories/orderRepository.js';
import { payForOrder } from './Pizza/application/payForOrder.js';
import { sendDelivery } from './Pizza/application/sendDelivery.js';
import { deliveryFactory } from './Pizza/repositories/deliveryRepository.js';
import { registerEndpoints, largePeperoniPizza, mainStLocation } from './Pizza/incoming/router.js';
import { createQueueMock } from './Queue/queueMock.test.js';
import { subscribeToPizzaQueue } from './Pizza/incoming/worker.js';

const noop = async (): Promise<void> => {};

describe('Order pizza', () => {
  // Test the functionality
  test('should create an order for the pizza', () => {
    const order = orderPizza(
      largePeperoniPizza, 
      mainStLocation,
    );

    expect(order.items.length).toBe(1);
    expect(order.items[0].name).toBe('Pepperoni');
    expect(order.items[0].size).toBe('Large');
    expect(order.total).toBe(15.99);
    expect(order.location.address).toBe('123 Main St');
    expect(order.location.phone).toBe('555-1234');
    expect(order.isPaid).toBe(false);
    expect(order.isDelivered).toBe(false);
  });

  // Test the endpoint
  test('Pizza is ordered using the api', async () => {
    const orderPizzaSpy = vi.spyOn(OrderModule, 'orderPizza');
    const app = registerEndpoints(noop);
    await request(app).post('/order/large/peperoni/mainst');
    expect(orderPizzaSpy).toHaveBeenCalled();
  });
});

describe('Pay for order', () => {
  // Test the functionality
  test('should mark the order as paid', () => {
    const order = orderFactory(
      [largePeperoniPizza], 
      mainStLocation,
    );
  
    payForOrder(order, noop);

    const paidOrder = getOrderById(order.id);
    expect(paidOrder.isPaid).toBe(true);
    expect(paidOrder.isDelivered).toBe(false);
  });

  test('Should not change the order otherwise', () => {
    const order = orderFactory(
      [largePeperoniPizza], 
      mainStLocation,
    );
  
    payForOrder(order, noop);

    const paidOrder = getOrderById(order.id);
    expect(paidOrder.items.length).toBe(1);
    expect(paidOrder.items[0].name).toBe('Pepperoni');
    expect(paidOrder.items[0].size).toBe('Large');
    expect(paidOrder.total).toBe(15.99);
    expect(paidOrder.location.address).toBe('123 Main St');
    expect(paidOrder.location.phone).toBe('555-1234');
  });

  // Test the endpoint
  test('Payment comes in with incoming webhook', async () => {
    const payForOrderSpy = vi.spyOn(PayModule, 'payForOrder');
    const app = registerEndpoints(noop);
    const order = orderFactory(
      [largePeperoniPizza], 
      mainStLocation,
    );

    await request(app).post(`/payment/paypal/${order.id}`);
    expect(payForOrderSpy).toBeCalledWith(order, noop);
  });
});

describe('Send delivery', () => {
  // Test the functionality
  test('should send a delivery', () => {
    let order = orderFactory(
      [largePeperoniPizza], 
      mainStLocation,
    );

    order = order.markAsPaid();

    const delivery = deliveryFactory(order);

    sendDelivery(delivery);
    const deliveredOrder = getOrderById(order.id);
    expect(deliveredOrder.isDelivered).toBe(true);
  });

  test('Delivery is handled by queue', () => {
    const orderPizzaSpy = vi.spyOn(DeliveryModule, 'sendDelivery');
    const {
      addMessageToQueue,
      subscribeToQueue,
      waitForQueueToFinish
    } = createQueueMock();

    subscribeToPizzaQueue(subscribeToQueue);
    registerEndpoints(addMessageToQueue);

    const order = orderFactory(
      [largePeperoniPizza], 
      mainStLocation,
    );

    payForOrder(order, addMessageToQueue);
    waitForQueueToFinish();

    // Option 1: check if it has been called
    const delivery = deliveryFactory(order);
    expect(orderPizzaSpy).toHaveBeenCalledWith(delivery);
  });
});

describe('Order and pay pizza', async () => {
  // End-to-end test
  test('Should deliver the pizza', async () => {
    const {
      addMessageToQueue,
      subscribeToQueue,
      waitForQueueToFinish
    } = createQueueMock();
    subscribeToPizzaQueue(subscribeToQueue);
    const app = registerEndpoints(addMessageToQueue);
    const orderId = readNextOrderId();

    await request(app).post('/order/large/peperoni/mainst');
    await request(app).post(`/payment/paypal/${orderId}`);
    waitForQueueToFinish();

    const order = getOrderById(orderId);
    expect(order.isDelivered).toBe(true);
  });
});
