// Custom ESLint rules for React DOM prop validation
module.exports = {
  rules: {
    // Prevent common React Native props from being passed to DOM elements
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXAttribute[name.name="textAlign"]',
        message: 'Use textAlign in style prop instead of as a direct DOM attribute'
      },
      {
        selector: 'JSXAttribute[name.name="onChangeText"]',
        message: 'Use onChange instead of onChangeText for web compatibility'
      },
      {
        selector: 'JSXAttribute[name.name="accessibilityLabel"]',
        message: 'Use aria-label instead of accessibilityLabel for web'
      },
      {
        selector: 'JSXAttribute[name.name="testID"]',
        message: 'Use data-testid instead of testID for web'
      }
    ]
  }
}