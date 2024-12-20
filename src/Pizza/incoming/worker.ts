import { ISubscribeToQueue } from '../../Queue/subscribeToQueue.js';
import { sendDelivery } from '../application/sendDelivery.js';
import { OrderId } from '../Order.js';
import { deliveryFactory } from '../repositories/deliveryRepository.js';
import { getOrderById } from '../repositories/orderRepository.js';

export interface PizzaDeliveryMessage {
  orderId: OrderId;
}

export const DELIVER_PIZZA_QUEUE = 'deliver-pizza';

export const subscribeToPizzaQueue = (
  subscribeToQueue: ISubscribeToQueue,
): void => {
  subscribeToQueue(DELIVER_PIZZA_QUEUE, (message: PizzaDeliveryMessage) => {
    const order = getOrderById(message.orderId);
    const delivery = deliveryFactory(order);
    sendDelivery(delivery);
  });
};
