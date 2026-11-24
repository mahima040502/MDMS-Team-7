export function options(values: string[]) {
  return values.map((value) => ({ value, label: value }));
}

export const usageFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
