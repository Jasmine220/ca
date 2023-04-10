module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
        "eslint:recommended", "prettier",
        "plugin:@typescript-eslint/recommended",
    ],
    plugins: ["prettier", "@typescript-eslint"],
    env: {
        node: true,
        es6: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    rules: {
        "no-unused-vars": "off",
        "prettier/prettier": ["error"],
        "@typescript-eslint/explicit-function-return-type": ["error"],
        "@typescript-eslint/no-unused-vars": ["error", { 'argsIgnorePattern': '^_' }],
        "default-case": ["error"]
    },
    root: true
};