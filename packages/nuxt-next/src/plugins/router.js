export default ({ app }) => {
  app.router.beforeEach((to, from, next) => {
    app.router.to = to;
    app.router.from = from;
    next();
  });
};
