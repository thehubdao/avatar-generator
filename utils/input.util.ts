export function GetStringToNumberInput(currentValue: string = '') {
  let newNumber = 0;
  if (currentValue.includes(','))
    return newNumber = Number(currentValue.replace(',', '.'));
  return newNumber = Number(currentValue);
};