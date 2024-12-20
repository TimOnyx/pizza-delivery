import { Delivery } from '../Delivery.js';

export const sendDelivery = (delivery: Delivery): void => {
  console.log("sent delivery to", delivery.location.address);
  delivery.markAsDelivered();
};

