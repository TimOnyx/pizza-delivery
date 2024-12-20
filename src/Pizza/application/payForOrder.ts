import { IAddMessageToQueue } from '../../Queue/addMessageToQueue.js';
import { DELIVER_PIZZA_QUEUE, PizzaDeliveryMessage } from '../incoming/worker.js';
import { Order } from '../Order.js';

export const payForOrder = async (order: Order, addMessageToQueue: IAddMessageToQueue): Promise<void> => {
  console.log("order paid for address", order.location.address);
  order.markAsPaid();
  const message: PizzaDeliveryMessage = { orderId: order.id };
  await addMessageToQueue<PizzaDeliveryMessage>(DELIVER_PIZZA_QUEUE, message);
};
