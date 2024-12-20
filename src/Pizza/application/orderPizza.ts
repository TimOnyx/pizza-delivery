import { Location } from '../Location.js';
import { Order } from '../Order.js';
import { Pizza } from '../Pizza.js';
import { orderFactory } from '../repositories/orderRepository.js';

export const orderPizza = (pizza: Pizza, location: Location): Order => {
  console.log("ordered pizza", pizza.name, "to", location.address);
  return orderFactory([pizza], location);
};
