import express from 'express';
import { orderPizza } from '../application/orderPizza.js';
import { pizzaFactory } from '../repositories/pizzaRepository.js';
import { getOrderById } from '../repositories/orderRepository.js';
import { IAddMessageToQueue } from '../../Queue/addMessageToQueue.js';
import { payForOrder } from '../application/payForOrder.js';

export const largePeperoniPizza = pizzaFactory('Pepperoni', 'Large', 15.99);
export const mainStLocation = { address: '123 Main St', phone: '555-1234' };

export const registerEndpoints = (addMessageToQueue: IAddMessageToQueue): express.Express => {
  const app = express();
  app.post('/order/large/peperoni/mainst', (_req, res) => {
    orderPizza(
      largePeperoniPizza, 
      mainStLocation,
    );
    res.status(200).json({ message: 'Order placed' });
  });
  
  app.post('/payment/paypal/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const order = getOrderById(parseInt(orderId));
    payForOrder(order, addMessageToQueue);
    res.status(200).json({ message: 'Order paid' });
  });

  return app;
};
