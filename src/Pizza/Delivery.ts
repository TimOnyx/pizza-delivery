import { Location } from './Location.js';
import { Order } from './Order.js';
import { Pizza } from './Pizza.js';

export class Delivery {
  constructor(
    public readonly items: Pizza[],
    public readonly location: Location,
    private order: Order,
  ) { }

  public markAsDelivered(): void {
    this.order = this.order.markAsDelivered();
  }
}
