/**
 * Adds two numbers and returns the result.
 *
 * @param {number} firstNumber - The first number entered by the user.
 * @param {number} secondNumber - The second number entered by the user.
 * @returns {number} The sum of the two numbers.
 */
function addNumbers(firstNumber, secondNumber) {
  return firstNumber + secondNumber;
}

// Prompt the user to enter the first number.
const firstNumber = Number(prompt('Enter first number:'));

// Prompt the user to enter the second number.
const secondNumber = Number(prompt('Enter second number:'));

// Calculate the sum of the two numbers.
const sum = addNumbers(firstNumber, secondNumber);

// Display the result in the browser console.
console.log(`Sum: ${sum}`);

// Display the result in a pop-up dialog.
alert(`Sum: ${sum}`);
