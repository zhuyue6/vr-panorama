module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'rpx',
      viewportWidth: 750,
      unitPrecision: 4,
      viewportUnit: "vw",
      minPixelValue: 0.1,
    },
  },
};