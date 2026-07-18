export default {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      stage: 0,
      features: {
        "nesting-rules": true,
        "custom-media-queries": true,
        "media-query-ranges": false,
        "cascade-layers": true,
        "logical-properties-and-values": false,
      },
      browsers: ["iOS >= 12"],
    },
    "@csstools/postcss-oklch-to-rgb": {},
  },
};
