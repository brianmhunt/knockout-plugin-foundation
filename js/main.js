// 
// Main Javascript file for the Knockout Plugins website
// 


var loading_complete = ko.observable(true),
    sort_by = ko.observable('stargazers_count'),
    plugins_filter = ko.observable('').extend({rateLimit: 200}),
    all_plugins_array = ko.observableArray(),
    filtered_plugins_array,
    sorted_plugins_array = ko.observableArray(),
    stale_after_ms = 1000 * 60 * 60, // Refresh ever hour
    now = new Date();

// Loading / mapping
function load_info_from_github(identity) {
  var object = localStorage.getItem(identity),
      fresh = object && object._last_refresh && object._last_refresh + stale_after_ms > now,
      request;
  if (object && fresh) {
    return JSON.parse(object);
  }
  request = $.Deferred()
  function on_get(info) {
    info._last_refresh = now.getTime();
    localStorage.setItem(identity, JSON.stringify(info));
    request.resolve(info);
  }
  function on_err(err) {
    // Fake a GitHub response, and throw in the error.
    request.resolve({
      owner: {login: identity.split('/')[0]},
      name: identity.split('/')[1],
      full_name: identity,
      identity: identity,
      html_url: "https://github.com/" + identity,
      err: err.responseText
    });
  }
  $.getJSON("https://api.github.com/repos/" + identity)
    .then(on_get)
    .fail(on_err);
  return request;
}

function map_plugins_to_objects(plugins_list) {
  $.when.apply($.when, $.map(plugins_list, load_info_from_github))
    .then(function () {
      all_plugins_array([].slice.call(arguments));
      loading_complete(true);
    })
    .fail(function (err) {
      console.error("Could not get the plugins from GitHub/localStorage:", err);
    });
}


// Filtering
filtered_plugins_array = all_plugins_array.filter(filter_function);

function filter_function(item) {
  var filter = ko.unwrap(plugins_filter);
  return item.full_name.indexOf(filter) >= 0;
}

// Sorting (painfully inefficient, but it's a small list.)
function resort() {
  var sorted = filtered_plugins_array().slice(0),
      reverse = false,
      prop = sort_by();
  if (prop.substr(0,1) === '-') {
    prop = prop.substr(1);
    reverse = true;
  }
  compare_fn = function (a, b) {
    return a[prop] === b[prop] ? 0 : (a[prop] < b[prop] ? 1 : -1);
  };
  sorted.sort(compare_fn);
  if (reverse) {
    sorted = sorted.reverse();
  }
  sorted_plugins_array(sorted);
}

filtered_plugins_array.subscribe(resort);
sort_by.subscribe(resort);

// Create a component - turn the list items (eg "brianmhunt/knockout-else") into objects
// populated with info from the GitHub API.
function PluginModel(params) {
  var p = params.plugin,
      updated = new Date(p.pushed_at);
  this.owner = p.owner.login;
  this.name = p.name;
  this.stargazers_count = p.stargazers_count;
  this.watchers_count = p.watchers_count;
  this.forks_count = p.forks_count;
  this.open_issues_count = p.open_issues_count;
  this.description = p.description;
  this.html_url = p.html_url;
  this.owner_url = p.owner.html_url;
  this.updated_at = updated.toDateString();
  this.err = p.err;
}

ko.components.register('ko-plugin', {
  viewModel: PluginModel,
  template: {element: "plugin-model-template"}
});

// Enable Punches and apply the bindings to the DOM.
ko.punches.enableAll();
ko.applyBindings({
  plugins: sorted_plugins_array,
  loading_complete: loading_complete,
  plugins_filter: plugins_filter
  // sort_by: sort_by
});

// Load the plugins.
$.getJSON('plugins.json').then(map_plugins_to_objects);
