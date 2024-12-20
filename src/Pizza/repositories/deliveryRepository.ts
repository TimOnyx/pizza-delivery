import { Delivery } from '../Delivery.js';
import { Order } from '../Order.js';

export const deliveryFactory = (
  order: Order,
): Delivery => {
  return new Delivery(
    order.items,
    order.location,
    order,
  );
}