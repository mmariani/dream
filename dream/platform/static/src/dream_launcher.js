/* ===========================================================================
 * Copyright 2013 Nexedi SARL and Contributors
 *
 * This file is part of DREAM.
 *
 * DREAM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * DREAM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with DREAM.  If not, see <http://www.gnu.org/licenses/>.
 * =========================================================================== */

(function($, _) {
  "use strict";
  jsPlumb.bind("ready", function() {
    var dream_instance, jio;
    //jio = new jIO.newJio({type: "local", username: "dream", applicationname: "dream"});

    var window_id = 1;
    var id_container = {}; // to allow generating next ids, like Machine_1, Machine_2, etc
    var property_container = {entity: {id: "entity", type:"string", _class: "Dream.Property", default: "Part"},
                              // XXX is it possible not to repeat id ?
                              mean: {id: "mean", type: "string", _class: "Dream.Property", default: "0.9"},
                              distributionType: {id: "distributionType", type: "string", _class: "Dream.Property", default: "Fixed"},
                              stdev: {id: "stdev", type: "string", _class: "Dream.Property", default: "0.1"},
                              min: {id: "min", type: "string", _class: "Dream.Property", default: "0.1"},
                              max: {id: "max", type: "string", _class: "Dream.Property", default: "1"},
                              failureDistribution: {id: "failureDistribution", type: "string", _class: "Dream.Property", default:"No"},
                              MTTF: {id: "MTTF", type: "string", _class: "Dream.Property", default: "40"},
                              MTTR: {id: "MTTR", type: "string", _class: "Dream.Property", default: "10"},
                              repairman: {id: "repairman", type: "string", _class: "Dream.Property", default: "None"},
                              isDummy: {id: "isDummy", type: "string", _class: "Dream.Property", default: "0"},
                              capacity: {id: "capacity", type: "string", _class: "Dream.Property", default: "1"},
                              numberOfReplications: {id: "numberOfReplications", type: "string", _class: "Dream.Property", default: "10"},
                              maxSimTime: {id: "maxSimTime", type: "string", _class: "Dream.Property", default: "100"},
                              confidenceLevel: {id: "confidenceLevel", type: "string", _class: "Dream.Property", default: "0.5"},
                              processTimeout: {id: "processTimeout", type: "string", _class: "Dream.Property", default: "0.5"},
    };
    property_container["interarrivalTime"] =  {id:"interarrivalTime",
                                               property_list: [property_container["mean"], property_container["distributionType"]],
                                               _class: "Dream.PropertyList"};
    property_container["processingTime"] = {id:"processingTime",
                                            property_list: [property_container["mean"], property_container["distributionType"],
                                                            property_container["stdev"], property_container["min"],
                                                            property_container["max"],
                                            ],
                                            _class: "Dream.PropertyList"};
    property_container["failures"] = {id:"failures",
                                      property_list: [property_container["failureDistribution"], property_container["MTTF"],
                                                      property_container["MTTR"], property_container["repairman"],
                                      ],
                                      _class: "Dream.PropertyList"};

    var configuration = {
      "Dream-Source": { anchor: {RightMiddle: {}}, /* TODO: make anchor not a configuration option and allow to connect from everywhere */
                        property_list: [property_container["interarrivalTime"], property_container["entity"]],
                        _class: 'Dream.Source',
      },
      "Dream-Machine": { anchor: {RightMiddle: {}, LeftMiddle: {}, TopCenter: {}, BottomCenter: {}},
                         property_list: [property_container["processingTime"], property_container["failures"]],
                         _class: 'Dream.Machine',
      },
      "Dream-Queue": { anchor: {RightMiddle: {}, LeftMiddle: {}},
                       property_list: [property_container["capacity"], property_container["isDummy"]],
                       _class: 'Dream.Queue',
      },
      "Dream-Exit": { anchor: {LeftMiddle: {},}, _class: 'Dream.Exit' },
      "Dream-Repairman": { anchor: {TopCenter: {}, BottomCenter: {}},
                           property_list: [property_container["capacity"]],
                           _class: 'Dream.Repairman',
      },
      "Dream-Configuration": { property_list: [ property_container["numberOfReplications"],
                                                property_container["maxSimTime"],
                                                property_container["confidenceLevel"],
                                                property_container["processTimeout"], ],
                               _class: 'Dream.Repairman', },
    };

    // Display tools
    var render_element = $("[id=tools]");
    _.each(_.pairs(configuration), function(value, key, list) {
      if (value[0] !== 'Dream-Configuration') { // XXX
        render_element.append('<div id="' + value[0] + '" class="tool">' +
                    value[0].split('-')[1] + "<ul/></div>");
      };
    });
    // Make tools draggable
    /*
{
    _class: "Dream.Queue"
capacity: "1"
isDummy: "0"
left: 0.4414893617021277
name: "Q1"*/
    $( ".tool" ).draggable({ opacity: 0.7, helper: "clone",
                             stop: function(tool) {
                                     var graph = $("#graph").data("dreamGrapheditor");
                                     var box_top, box_left, _class, node_data = {};n
                                     id_container[tool.target.id] = (id_container[tool.target.id] || 0) + 1;
                                     _class = tool.target.id.replace('-', '.'); // XXX - vs .
                                     node_data.left = (tool.clientX - $("#graph").position().left) / $("#graph").width();
                                     node_data.top = (tool.clientY - $("#graph").position().top) / $("#graph").height();
                                     console.log("dream_launcher, id_container", node_data);
                                     graph.add_node(tool.target.id, node_data);
                                     window_id += 1;
                                  },
    });

  });

})(jQuery, _);
