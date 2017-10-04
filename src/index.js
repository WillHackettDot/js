// Will Hackett APIs Primary entrypoint

const libraries = {
  datetime: () => import('./datetime'),
  phone: () => import('./phone')
}

class WillHackett {
  constructor(config = { reporting: true }) {
    this.config = config;

    this.inputFieldSelector = this.inputFieldSelector.bind(this);

    this.captureException = () => false;

    if (this.config.reporting === true) {
      this.loadRaven();
    }

    if (this.config.libs) {
      this.config.libs.forEach(lib => this.load(lib))
    }

    window.WH = this;
  }
  async load(name) {
    try {
      const Library = await libraries[name]();
      this[name] = new Library.default(this);
      return this[name]
    } catch (err) {
      console.error(`[WH] ${err.message}`);
    }
  }
  async loadRaven() {
    try {
      const Raven = await import('raven-js');
      Raven.config('https://61a76bdaca3e44489dfb4f2e950dd1d8@sentry.io/225695', {
        ignoreErrors: ['*']
      }).install()
      this.captureException = (...stuff) => Raven.captureException(...stuff)
    } catch (err) {
      this.captureException(err);
      console.warn(`[WH] Could not load Sentry error reporting.`)
    }
  }
  getJQuery() {
    const $ = window.$ || window.jQuery;
    if (!$) {
      throw new Error('[WH] jQuery is required for field selection and it cannot be found.');
    }
    return $;
  }
  inputFieldSelector(finder) {
    try {
      const $ = this.getJQuery();
      if (this.config.squarespace === true) {
        return $(`label:contains(${finder})~input`)
      } else {
        return $(finder)
      }
    } catch (err) {
      this.captureException(err);
      console.error(err.message)
    }
  }
  ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
}
window.WillHackett = WillHackett;
