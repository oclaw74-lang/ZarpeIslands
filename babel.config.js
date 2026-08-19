module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // WatermelonDB usa decoradores (@field, @date, @readonly) — debe ir primero.
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
  };
};
