module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-console": "error",
    "no-namespace": "off",
    "no-invalid-regexp": "error",
    "no-case-declarations": "off",
    "no-unused-vars": "off",
    "no-var-requires": "off",
    "semi": ["error", "always"],
    "security/detect-object-injection": "off",
    "indent": ['error', 2, { FunctionDeclaration: { parameters: 'first' } }],
    "no-trailing-spaces": 'error',
    "eol-last": ['error', 'always']
  },
};
