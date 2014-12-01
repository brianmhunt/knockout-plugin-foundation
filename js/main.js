var plugins_list = ko.observableArray();
var plugins_filter = ko.observable('');

// Filtering
var filtered_plugins_list = plugins_list.filter(filter_function);

function filter_function(item) {
  var filter = ko.unwrap(plugins_filter);
  return item.indexOf(filter) >= 0;
}

// Sorting
// var sorted_plugins_list = ko.computed(compute_sorted_list);
// var sort_by = ko.observable();
// function compute_sorted_list() {
//   var sort_fn;
//   switch(sort_by()) {
//     case 'stars':
//       sort_fn = function (a, b) {
//         return a.stargazers_count == b.stargazers_count ? 0 :
//         (a.stargazers_count < b.stargazers_count ? -1 : 1);
//       }
//     default:
      
//   }
// }


// Get the list of plugins
$.getJSON('plugins.json').then(plugins_list);

// Create a component - turn the list items (eg "brianmhunt/knockout-else") into objects
// populated with info from the GitHub API.
function PluginModel(params) {
  var identity = this.identity = params.plugin;
  this.about = ko.observable(null);
  this.err = ko.observable();
  this.about(JSON.parse(localStorage.getItem(identity)));

  if (!this.about()) {
    var subs = null;
    subs = this.about.subscribe(function (about) {
      localStorage.setItem(identity, JSON.stringify(about));
      subs.dispose();
    });
    $.getJSON("https://api.github.com/repos/" + identity)
      .then(this.about, this.err)
  }
}

ko.components.register('ko-plugin', {
  viewModel: PluginModel,
  template: {element: "plugin-model-template"}
});

// Enable Punches and apply the bindings.
ko.punches.enableAll();
ko.applyBindings({
  plugins: filtered_plugins_list,
  // sort_by: sort_by
});