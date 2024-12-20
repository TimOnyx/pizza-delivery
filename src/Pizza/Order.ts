import { Location } from './Location.js';
import { Pizza } from './Pizza.js';


export type OrderId = Flavor<number, 'order_id'>;

export class Order {
  public readonly total: number;

  constructor(
    public readonly id: OrderId,
    public readonly items: Pizza[],
    public readonly location: Location,
    private update: (order: Order) => Order,
    private paid = false,
    private delivered = false,
  ) {
    let total = 0;

    for (const item of items) {
      total += item.price;
    }

    this.total = total;
  }

  public markAsPaid(): Order {
    if (this.paid) {
      throw new Error('Order has already been paid');
    }

    this.paid = true;
    return this.update(this);
  }

  public markAsDelivered(): Order {
    if (!this.paid) {
      throw new Error('Order has not been paid');
    }

    if (this.delivered) {
      throw new Error('Order has already been delivered');
    }

    this.delivered = true;
    return this.update(this);
  }

  public get isPaid(): boolean {
    return this.paid;
  }

  public get isDelivered(): boolean {
    return this.delivered;
  }
}
