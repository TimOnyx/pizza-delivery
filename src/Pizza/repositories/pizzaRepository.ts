import { Pizza, PizzaId } from '../Pizza.js';

const pizzaRepository: Map<PizzaId, Pizza> = new Map();
let idCounter: PizzaId = 0;

export const pizzaFactory = (type: string, size: string, price: number): Pizza => {
  idCounter += 1;
  const pizza = new Pizza(idCounter, type, size, price);
  pizzaRepository.set(idCounter, pizza);
  return pizza;
};

export const getPizzaById = (id: PizzaId): Pizza => {
  return pizzaRepository.get(id);
};
