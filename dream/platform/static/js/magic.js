(function(window, document, $) {
  /*
  // NOTE:
  // beware to update all display texts when using multiple languages

  // NOTE:
  // temporary setup to keep user settings!
  // this is USER-SETTINGS
  var User = jIO.newJio({
    "type": "local",
    "username": "setup",
    "application_name": "slapos"
  });

  User.get({"_id":"configuration"}, function (err, response) {
    if (err) {
      // no user config stored, load default
      $.when($.ajax({
        "url": "data/default_configuration.json",
        "dataType": "json"
        })
      ).then(function(data, textStatus, jqXHR) {
        console.log(data);
        }
      ).fail(function(data, textStatus, jqXHR) {
        alert("Could not load application configuration");
        }
      );
    } else {

    }
  });
  */

  // TODO: save user settings in JIO localstorage
  // tab handler
  var count = 0,
    parent,
    create_tab,
    tab_index,
    tab_body,
    tab_add_gadget,
    tab_header,
    tab_text,
    tab_edit,
    tab_delete,
    tab;

    factory_link = document.createElement("a");
    factory_link.setAttribute("data-role", "button");
    factory_link.setAttribute("href", "#");

    factory_header = document.createElement("h1");
    factory_div = document.createElement("div");

  // add a new tab
  $("div.ui-dynamic-tabs div.tab_add").on("collapsiblebeforeexpand", function (e) {

    e.preventDefault();

    parent = e.target.parentNode;

    if (count === 0) {
      if (parent.className.match(/(?:^|\s)ui-dynamic-tabs-added(?!\S)/) === null) {
        parent.className += " ui-dynamic-tabs-added";
      }
    }

    tab_index = "Tab-" + count;
    count += 1;
    create_tab = prompt("Please name your new tab", tab_index);

    if (create_tab !== null && create_tab !== undefined) {
      tab = factory_div.cloneNode();
      tab.setAttribute("data-role", "collapsible");
      tab.setAttribute("data-collapsed", "true");
      tab.setAttribute("data-icon", "false");

      tab_header = factory_header.cloneNode();

      tab_edit = factory_link.cloneNode();
      tab_edit.setAttribute("data-iconpos", "notext");
      tab_edit.setAttribute("data-icon", "pencil");
      tab_edit.setAttribute("data-rel", "edit");
      tab_edit.setAttribute("class", "tab_action");
      tab_edit.appendChild( document.createTextNode("Edit"));

      tab_delete = factory_link.cloneNode();
      tab_delete.setAttribute("data-iconpos", "notext");
      tab_delete.setAttribute("data-icon", "remove");
      tab_delete.setAttribute("data-rel", "delete");
      tab_delete.setAttribute("class", "tab_action tab_action_last");
      tab_delete.appendChild( document.createTextNode("Delete"));

      tab_body = window.document.createDocumentFragment();
      // add active gadgets here!
      tab_add_piece = factory_link.cloneNode();
      tab_add_piece.setAttribute("href","gadgetCatalog");
      tab_add_piece.setAttribute("data-icon", "puzzle-piece");
      tab_add_piece.setAttribute("data-iconpos", "left");
      tab_add_piece.setAttribute("data-inline", "true");
      tab_add_piece.className = "dashed gadget_add";
      tab_add_piece.appendChild( document.createTextNode("Add Gadget") );

      tab_body.appendChild(tab_add_piece);

      tab_header.appendChild(document.createTextNode( create_tab ));
      tab_header.appendChild(tab_edit);
      tab_header.appendChild(tab_delete);
      tab.appendChild(tab_header);
      tab.appendChild(tab_body);

      parent.insertBefore(tab, e.target);

      // enhance, set edit and remove bindings
      $(parent)
        .collapsibleset("refresh")
        .enhanceWithin()
        .find(".tab_action")
        .on("click", function (e) {
          var action, collapsible, proceed;

          // prevent action on collapsible
          e.stopPropagation();
          e.stopImmediatePropagation();

          action = e.target.getAttribute("data-rel");

          if (action === "delete") {
            proceed = confirm("Do you really want to remove this tab and included gadgets?");
            if (proceed) {
              collapsible = e.target.parentNode.parentNode;
              collapsible.parentNode.removeChild(collapsible);
              // reset
              $(parent).collapsibleset("refresh");

              // update parent
              count -= 1;
              if (count === 0) {
                parent.className = parent.className.replace(/(?:^|\s)ui-dynamic-tabs-added(?!\S)/g , '')
              }
            }
          } else if (action === "edit") {
            proceed = prompt("Please rename your tab", e.target.parentNode.childNodes[0].text);
            if (proceed !== null) {
              e.target.parentNode.childNodes[0].innerHTML = proceed;
            }
          }
        });
    }
  });

}(window, document, jQuery));