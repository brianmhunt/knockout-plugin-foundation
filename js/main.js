var plugins_list = ko.observableArray();
var plugins_filter = ko.observable();
var filtered_plugins_list = plugins_list.filter(filter_function);

function filter_function(item) {
  var filter = ko.unwrap(plugins_filter);
  return item.user.indexOf(filter) >= 0 || item.repo.indexOf(filter) >= 0;
}

$.get('plugins.json').then(plugins_list);

function PluginModel(params) {
  this.plugin = params.plugin;
  this.user = this.plugin.user;
  this.repo = this.plugin.repo;
  this.about = ko.observable(null);
  var identity = this.user + "/" + this.repo;

  this.about(localStorage.getItem(identity));

  if (!this.about()) {
    var subs = null;
    subs = this.about.subscribe(function (about) {
      localStorage.setItem(identity, about);
      subs.dispose();
    });
    $.get("https://api.github.com/repos/" + identity)
      .then(this.about)
  }
}

ko.components.register('ko-plugin', {
  viewModel: PluginModel,
  template: {element: "plugin-model-template"}
});

ko.punches.enableAll();
ko.applyBindings({
  plugins: filtered_plugins_list,
  refresh_click: function () {
    var saved_list = plugins_list();
    localStorage.clear();
    // Force a refresh with new PluginModel instances
    plugins_list.valueHasMutated([]);
    plugins_list
  }
});