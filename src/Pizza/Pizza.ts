
export type PizzaId = Flavor<number, 'pizza_id'>;

export class Pizza {
  constructor(
    public readonly id: PizzaId,
    public readonly name: string,
    public readonly size: string,
    public readonly price: number
  ) { }
}
