import { extname } from 'path';
import { cloneDeep } from 'lodash';
import VueMeta from 'vue-meta';
// import { createRenderer } from '@vue/server-renderer';
// @ts-ignore

import LRU from 'lru-cache';
import devalue from '@nuxt/devalue';
// @ts-ignore

import { TARGETS, isModernRequest } from '@nuxt/utils';
import BaseRenderer from './base';

export default class SPARenderer extends BaseRenderer {
  cache: any;
  vueMetaConfig: any;
  constructor(serverContext: { options: any }) {
    super(serverContext);

    this.cache = new LRU();

    this.vueMetaConfig = {
      ssrAppId: '1',
      ...this.options.vueMeta,
      keyName: 'head',
      attribute: 'data-n-head',
      ssrAttribute: 'data-n-head-ssr',
      tagIDKeyName: 'hid',
    };
  }

  createRenderer() {
    return {};
  }

  // @ts-ignore
  async render(renderContext: {
    res?: { setHeader: (arg0: string, arg1: string) => void };
    head?: any;
    runtimeConfig?: any;
    staticAssetsBase?: any;
    url?: any;
    req?: any;
  }) {
    const { url = '/', req = {} } = renderContext;
    const modernMode = this.options.modern;
    const modern =
      (modernMode && this.options.target === TARGETS.static) ||
      isModernRequest(req, modernMode);
    const cacheKey = `${modern ? 'modern:' : 'legacy:'}${url}`;
    let meta = this.cache.get(cacheKey);

    if (meta) {
      // Return a copy of the content, so that future
      // modifications do not effect the data in cache
      return cloneDeep(meta);
    }

    meta = {
      HTML_ATTRS: '',
      HEAD_ATTRS: '',
      BODY_ATTRS: '',
      HEAD: '',
      BODY_SCRIPTS_PREPEND: '',
      BODY_SCRIPTS: '',
    };

    if (this.options.features.meta) {
      // Get vue-meta context
      renderContext.head =
        typeof this.options.head === 'function'
          ? this.options.head()
          : cloneDeep(this.options.head);
    }

    // Allow overriding renderContext
    // @ts-ignore

    await this.serverContext.nuxt.callHook(
      'vue-renderer:spa:prepareContext',
      renderContext,
    );

    if (this.options.features.meta) {
      const m = VueMeta.generate(renderContext.head || {}, this.vueMetaConfig);

      // HTML_ATTRS
      // @ts-ignore

      meta.HTML_ATTRS = m.htmlAttrs.text();

      // HEAD_ATTRS
      // @ts-ignore

      meta.HEAD_ATTRS = m.headAttrs.text();

      // BODY_ATTRS
      // @ts-ignore

      meta.BODY_ATTRS = m.bodyAttrs.text();

      // HEAD tags
      meta.HEAD =
        // @ts-ignore

        m.title.text() +
        // @ts-ignore

        m.meta.text() +
        // @ts-ignore

        m.link.text() +
        // @ts-ignore

        m.style.text() +
        // @ts-ignore

        m.script.text() +
        // @ts-ignore

        m.noscript.text();

      // Add <base href=""> meta if router base specified
      if (this.options._routerBaseSpecified) {
        meta.HEAD += `<base href="${this.options.router.base}">`;
      }

      // BODY_SCRIPTS (PREPEND)
      meta.BODY_SCRIPTS_PREPEND =
        // @ts-ignore

        m.meta.text({ pbody: true }) +
        // @ts-ignore

        m.link.text({ pbody: true }) +
        // @ts-ignore

        m.style.text({ pbody: true }) +
        // @ts-ignore

        m.script.text({ pbody: true }) +
        // @ts-ignore

        m.noscript.text({ pbody: true });

      // BODY_SCRIPTS (APPEND)
      meta.BODY_SCRIPTS =
        // @ts-ignore

        m.meta.text({ body: true }) +
        // @ts-ignore

        m.link.text({ body: true }) +
        // @ts-ignore

        m.style.text({ body: true }) +
        // @ts-ignore

        m.script.text({ body: true }) +
        // @ts-ignore

        m.noscript.text({ body: true });
    }

    // Resources Hints
    meta.resourceHints = '';

    const {
      // @ts-ignore

      resources: { modernManifest, clientManifest },
    } = this.serverContext;
    const manifest = modern ? modernManifest : clientManifest;

    const {
      shouldPreload,
      shouldPrefetch,
    } = this.options.render.bundleRenderer;

    if (this.options.render.resourceHints && manifest) {
      const publicPath = manifest.publicPath || '/_nuxt/';

      // Preload initial resources
      if (Array.isArray(manifest.initial)) {
        const { crossorigin } = this.options.render;
        const cors = `${crossorigin ? ` crossorigin="${crossorigin}"` : ''}`;

        meta.preloadFiles = manifest.initial
          .map(SPARenderer.normalizeFile)
          // @ts-ignore

          .filter(({ fileWithoutQuery, asType }) =>
            shouldPreload(fileWithoutQuery, asType),
          )
          .map((file: any) => ({ ...file, modern }));

        meta.resourceHints += meta.preloadFiles
          // @ts-ignore
          .map(({ file, extension, fileWithoutQuery, asType, modern }) => {
            let extra = '';
            if (asType === 'font') {
              extra = ` type="font/${extension}"${cors ? '' : ' crossorigin'}`;
            }
            const rel =
              modern && asType === 'script' ? 'modulepreload' : 'preload';
            return `<link rel="${rel}"${cors} href="${publicPath}${file}"${
              asType !== '' ? ` as="${asType}"` : ''
            }${extra}>`;
          })
          .join('');
      }

      // Prefetch async resources
      if (Array.isArray(manifest.async)) {
        meta.resourceHints += manifest.async
          .map(SPARenderer.normalizeFile)
          // @ts-ignore

          .filter(({ fileWithoutQuery, asType }) =>
            shouldPrefetch(fileWithoutQuery, asType),
          )
          .map(
            // @ts-ignore

            ({ file }) => `<link rel="prefetch" href="${publicPath}${file}">`,
          )
          .join('');
      }

      // Add them to HEAD
      if (meta.resourceHints) {
        meta.HEAD += meta.resourceHints;
      }
    }

    // Serialize state (runtime config)
    // @ts-ignore
    let APP = `${meta.BODY_SCRIPTS_PREPEND}<div id="${this.serverContext.globals.id}">${this.serverContext.resources.loadingHTML}</div>${meta.BODY_SCRIPTS}`;

    const payload = {
      config: renderContext.runtimeConfig.public,
    };
    if (renderContext.staticAssetsBase) {
      // @ts-ignore

      payload.staticAssetsBase = renderContext.staticAssetsBase;
    }

    // @ts-ignore
    APP += `<script>window.${this.serverContext.globals.context}=${devalue(
      payload,
    )}</script>`;

    // Prepare template params
    const templateParams = {
      ...meta,
      APP,
      ENV: this.options.env,
    };
    // @ts-ignore
    // Call spa:templateParams hook
    await this.serverContext.nuxt.callHook(
      'vue-renderer:spa:templateParams',
      templateParams,
    );

    // Render with SPA template
    const html = this.renderTemplate(
      // @ts-ignore
      this.serverContext.resources.spaTemplate,
      templateParams,
    );
    const content = {
      html,
      preloadFiles: meta.preloadFiles || [],
    };

    // Set meta tags inside cache
    this.cache.set(cacheKey, content);

    // Return a copy of the content, so that future
    // modifications do not effect the data in cache
    return cloneDeep(content);
  }

  static normalizeFile(file: string) {
    const withoutQuery = file.replace(/\?.*/, '');
    const extension = extname(withoutQuery).slice(1);
    return {
      file,
      extension,
      fileWithoutQuery: withoutQuery,
      asType: SPARenderer.getPreloadType(extension),
    };
  }

  static getPreloadType(ext: string) {
    if (ext === 'js') {
      return 'script';
    } else if (ext === 'css') {
      return 'style';
    } else if (/jpe?g|png|svg|gif|webp|ico|avif/.test(ext)) {
      return 'image';
    } else if (/woff2?|ttf|otf|eot/.test(ext)) {
      return 'font';
    } else {
      return '';
    }
  }
}
