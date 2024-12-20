import { Location } from '../Location.js';
import { Order, OrderId } from '../Order.js';
import { Pizza } from '../Pizza.js';

const orderRepository = new Map<OrderId, Order>();
let idCounter: OrderId = 0;

export const readNextOrderId = (): OrderId => {
  return idCounter + 1;
};

export const orderFactory = (items: Pizza[], location: Location): Order => {
  idCounter += 1;
  const order = new Order(
    idCounter,
    items,
    location,
    updateOrder,
  );
  orderRepository.set(idCounter, order);
  return order;
}

const updateOrder = (order: Order): Order => {
  orderRepository.set(order.id, order);
  return getOrderById(order.id);
};

export const getOrderById = (id: OrderId): Order => {
  return orderRepository.get(id);
};
