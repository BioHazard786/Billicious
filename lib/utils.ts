import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function titleCase(str: string) {
  return str
    .split(" ")
    .map(function (word: string) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export const totalPayeeBill = (payees: { [key: string]: number }): number => {
  let total = 0;
  for (let amount of Object.values(payees)) {
    total += amount;
  }
  return total;
};
