import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),

  items: [],
  selection: null,
  resource: null,
  defaultQueryParams: null,
  placeholder: 'select item',
  async: true,
  create: false,

  createItemAction: Ember.computed('create', function() {
    return this.get('create') ? 'createItem' : false;
  }),

  findAll() {
    this.get('store').findAll(this.get('resource')).then( (items) => {
      this.refreshItems(items);
    });
  },

  findByQuery(params = { }) {
    this.get('store').queryRecord('search', this.queryParams(params)).then( (items) => {
      this.refreshItems(items);
    });
  },

  refreshItems(items) {
    this.set('items', items.get('searchables'));
    this.selectByName();
    this.autoFocus();
  },

  queryParams(params) {
    var defaults = this.get('defaultQueryParams');
    if (Ember.isPresent(defaults)) {
      if (Ember.isNone(params['query'])) {
        params['query'] = {};
      }
      for (var key in defaults) { params['query'][key] = defaults[key]; }
    }
    return params;
  },

  selectByName() {
    var name = this.get('autoSelectName');
    if (Ember.isPresent(name)) {
      var item = this.get('items').findBy('name', name);
      this.set('selection', item);
    }
  },

  autoFocus() {
    if (this.get('setFocus')) {
      this.$('input').focus();
    }
  },

  actions: {
    fetchItems() {
      if(this.get('async')) {
        this.findByQuery({ resource: this.get('resource') });
      } else if(Ember.isEmpty(this.get('items')) ) {
        this.findAll();
      }
    },

    selectItem(item) {
      Ember.tryInvoke(this, 'onSelect', item);
    },

    createItem(value) {
      var item = this.get('store').createRecord(this.get('resource'), { name: value });
      this.set('selection', item);
      Ember.tryInvoke(this, 'onSelect', item);
    },

    updateFilter(value) {
      if( this.get('async') && value.length === 3 ) {
        this.findByQuery({ resource: this.get('resource'), query: { name: value } });
      }
    }

  }
});
