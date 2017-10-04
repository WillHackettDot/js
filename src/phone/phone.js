class Phone {
  constructor(parent) {
    this.parent = parent;

    this.parent.ready(this.init.bind(this))
  }
  init() {
    console.log('I ready!')
  }
}
export default Phone;
