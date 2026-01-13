export class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  register(name, factory, options = { singleton: false }) {
    this.services.set(name, { factory, options });
  }

  resolve(name) {
    const service = this.services.get(name);
    
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    if (service.options.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory(this));
      }
      return this.singletons.get(name);
    }

    return service.factory(this);
  }

  clear() {
    this.services.clear();
    this.singletons.clear();
  }
}

export const container = new Container();
