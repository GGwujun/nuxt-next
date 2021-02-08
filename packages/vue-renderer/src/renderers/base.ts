export default class BaseRenderer {
  serverContext: { options: any };
  options: any;
  vueRenderer: void;
  constructor(serverContext: { options: any }) {
    this.serverContext = serverContext;
    this.options = serverContext.options;

    this.vueRenderer = this.createRenderer();
  }

  createRenderer() {
    throw new Error('`createRenderer()` needs to be implemented');
  }

  renderTemplate(
    templateFn: (arg0: any) => any,
    opts: {
      HTML_ATTRS: any;
      HEAD_ATTRS: any;
      BODY_ATTRS: any;
      HEAD?: string;
      APP?: any;
      ENV?: any;
      html_attrs?: any;
      head_attrs?: any;
      body_attrs?: any;
    },
  ) {
    // Fix problem with HTMLPlugin's minify option (#3392)
    opts.html_attrs = opts.HTML_ATTRS;
    opts.head_attrs = opts.HEAD_ATTRS;
    opts.body_attrs = opts.BODY_ATTRS;

    return templateFn(opts);
  }

  render() {
    throw new Error('`render()` needs to be implemented');
  }
}
