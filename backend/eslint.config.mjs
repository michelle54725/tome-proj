
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";


export default defineConfig([{
  files: ["**/*.js"],
  plugins: { js },
  extends: ["js/recommended", prettier],
  env: {
    node: true,
  },
}]);