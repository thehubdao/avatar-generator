export function GetStringToNumberInput(currentValue = '') {
  if (currentValue.includes(','))
    return Number(currentValue.replace(',', '.'));
  return Number(currentValue);
}