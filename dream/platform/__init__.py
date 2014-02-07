# ===========================================================================
# Copyright 2013 Nexedi SA
#
# This file is part of DREAM.
#
# DREAM is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# DREAM is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with DREAM.  If not, see <http://www.gnu.org/licenses/>.
# ===========================================================================

import sys
import json
import traceback
import multiprocessing
try:
	import pydot
except ImportError:
	print "Warning, pydot could not be found"	
import os.path
import logging

from flask import Flask, jsonify, redirect, url_for
from flask import request

app = Flask(__name__)
# Serve static file with no cache
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route("/")
def front_page():
  return redirect(url_for('static', filename='index.html'))

@app.route("/postJSONData", methods=["POST", "OPTIONS"])
def postJSONData():
  """Returns posted JSON data as it is for Export button"""
  data = json.loads(request.form.get('data'))
  response = jsonify(data)
  response.headers['Content-Disposition'] = 'attachment; filename=dream.json'
  return response

@app.route("/postJSONFile", methods=["POST", "OPTIONS"])
def postJSONFile():
  """Returns posted JSON file as it is for Import button"""
  data = json.load(request.files['file'])
  return jsonify(data)

@app.route("/positionGraph", methods=["POST", "OPTIONS"])
def positionGraph():
  """Uses graphviz to position nodes of the graph.
  """
  graph = pydot.Dot()

  for node_id, node in request.json['nodes'].iteritems():
    graph.add_node(pydot.Node(node_id))
  for edge in request.json['edges'].itervalues():
    graph.add_edge(pydot.Edge(edge[0], edge[1]))

  new_graph = pydot.graph_from_dot_data(graph.create_dot())

  # calulate the ratio from the size of the bounding box
  ratio = new_graph.get_bb()
  origin_left, origin_top, max_left, max_top = [float(p) for p in
    new_graph.get_bb().strip('"').split(',')]
  ratio_top = max_top - origin_top
  ratio_left = max_left - origin_left

  preference_dict = dict()
  for node in new_graph.get_nodes():
    # skip technical nodes
    if node.get_name() in ('graph', 'node', 'edge'):
      continue
    left, top = [float(p) for p in node.get_pos()[1:-1].split(",")]
    preference_dict[node.get_name().strip('"')] = dict(
      top=1-(top/ratio_top),
      left=1-(left/ratio_left),)

  return jsonify(preference_dict)


@app.route("/runSimulation", methods=["POST", "OPTIONS"])
def runSimulation():
  parameter_dict = request.json['json']
  app.logger.debug("running with:\n%s" % (json.dumps(parameter_dict,
                                          sort_keys=True, indent=2)))

  try:
    timeout = int(parameter_dict['general']['processTimeout'])
  except (KeyError, ValueError, TypeError):
    timeout = 60

  queue = multiprocessing.Queue()
  process = multiprocessing.Process(
    target=_runSimulation,
    args=(parameter_dict, queue))
  process.start()
  process.join(timeout)
  if process.is_alive():
    # process still alive after timeout, terminate it
    process.terminate()
    process.join()
    return jsonify(dict(error='Timeout after %s seconds' % timeout))

  result = queue.get()
  app.logger.debug("resulth:\n%s" % (json.dumps(result,
                                                sort_keys=True, indent=2)))
  return jsonify(result)

def _runSimulation(parameter_dict, queue):
  try:
    klass_name = 'dream.simulation.%s' % \
      parameter_dict['general']['simulationClass']
    klass = __import__(klass_name, globals(), {}, klass_name)
    result = klass.Simulation(logger=app.logger).run(parameter_dict)
    queue.put(dict(success=result))
  except Exception, e:
    tb = traceback.format_exc()
    app.logger.error(tb)
    queue.put(dict(error=tb))


def main(*args):
  # start the server
  file_handler = logging.FileHandler(os.path.join(os.path.dirname(__file__), '..', '..', 'log', 'dream.log'))
  file_handler.setLevel(logging.DEBUG)
  app.logger.addHandler(file_handler)
  app.run(debug=True)

def run(*args):
  # run with one topology input
  args = args or sys.argv[1:]
  input_data = json.load(open(args[0]))
  queue = multiprocessing.Queue()
  _runSimulation(input_data, queue)
  output_data = queue.get()
  print json.dumps(output_data, indent=True)


if __name__ == "__main__":
  main()

