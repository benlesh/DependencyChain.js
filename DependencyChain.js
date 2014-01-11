(function (window) {
   'use strict';
// Tarjan algorithm implementation based on
// https://gist.github.com/chadhutchins/1440602

   function DependencyChain() {
      var _vertices = [],
         _graph = new Graph(_vertices),
         _tarjan = new Tarjan(_graph),
         _dirty = false,
         _sccs = null,
         self = this;

      function getVertex(name) {
         var i, v;
         for (i = 0; i < _vertices.length; i++) {
            if (_vertices[i].name === name) {
               return _vertices[i];
            }
         }
         _dirty = true;
         v = new Vertex(name);
         _vertices.push(v);
         return v;
      }

      self.add = function (name, value, dependencyNames) {
         var v = getVertex(name);
         v.value = value;
         forEach(dependencyNames, function (dependencyName) {
            v.connections.push(getVertex(dependencyName));
         });
         return v;
      };

      function updateSCCs() {
         if (_sccs === null || _dirty) {
            _sccs = _tarjan.run();
         }
      }

      function hasCircularDependencies() {
         return any(_sccs, function (scc) {
            return scc.length > 1;
         });
      }

      self.prioritized = function () {
         updateSCCs();
         if (hasCircularDependencies()) {
            throw new Error("Circular dependencies detected");
            //TODO: add more detail.
         }

         var result = map(_sccs, function (scc) {
            return scc[0]
         });

         return result;
      };

      function Graph(vertices) {
         this.vertices = vertices || [];
      }

      function Vertex(name, value) {
         this.name = name || null;
         this.value = value || null;
         this.connections = [];

         // used in tarjan algorithm
         // went ahead and explicity initalized them
         this.index = -1;
         this.lowlink = -1;
      }

      Vertex.prototype = {
         equals: function (vertex) {
            // equality check based on vertex name
            return (vertex.name && this.name === vertex.name);
         }
      };

      function VertexStack(vertices) {
         this.vertices = vertices || [];
      }

      VertexStack.prototype.contains = function (vertex) {
         for (var i = 0; i < this.vertices.length; i++) {
            if (this.vertices[i].equals(vertex)) {
               return true;
            }
         }
         return false;
      };


      function Tarjan(graph) {
         this.index = 0;
         this.stack = new VertexStack();
         this.graph = graph;
         this.scc = [];
         this.run = function () {
            for (var i = 0; i < this.graph.vertices.length; i++) {
               if (this.graph.vertices[i].index < 0) {
                  this.strongconnect(this.graph.vertices[i]);
               }
            }
            return this.scc;
         };
         this.strongconnect = function (vertex) {
            // Set the depth index for v to the smallest unused index
            vertex.index = this.index;
            vertex.lowlink = this.index;
            this.index = this.index + 1;
            this.stack.vertices.push(vertex);

            // Consider successors of v
            // aka... consider each vertex in vertex.connections
            for (var i in vertex.connections) {
               var v = vertex;
               var w = vertex.connections[i];

               if (!w) throw new Error("missing dependency: " + i);

               if (w.index < 0) {
                  // Successor w has not yet been visited; recurse on it
                  this.strongconnect(w);
                  v.lowlink = Math.min(v.lowlink, w.lowlink);
               } else if (this.stack.contains(w)) {
                  // Successor w is in stack S and hence in the current SCC
                  v.lowlink = Math.min(v.lowlink, w.index);
               }
            }

            // If v is a root node, pop the stack and generate an SCC
            if (vertex.lowlink == vertex.index) {
               // start a new strongly connected component
               var vertices = [];
               var x = null;
               if (this.stack.vertices.length > 0) {
                  do {
                     x = this.stack.vertices.pop();
                     // add w to current strongly connected component
                     vertices.push(x);
                  } while (!vertex.equals(x));
               }
               // output the current strongly connected component
               // ... i"m going to push the results to a member scc array variable
               if (vertices.length > 0) {
                  this.scc.push(vertices);
               }
            }
         };
      }
   }

   function forEach(arr, fn) {
      if (arr.forEach) {
         arr.forEach(fn);
      } else {
         //TODO: better this.
         for (var i = 0; i < arr.length; i++) {
            fn(arr[i], i, arr);
         }
      }
   }

   function map(arr, fn) {
      if (arr.map) {
         return arr.map(fn);
      } else {
         //TODO: better this.
         var result = []
         forEach(arr, function (item, i, arr) {
            result.push(fn(item, i, arr));
         });
         return result;
      }
   }

   function firstWhere(arr, predicate) {
      for (var i = 0; i < arr.length; i++) {
         if (predicate(arr[i])) {
            return arr[i];
         }
      }
      return undefined;
   }

   function any(arr, predicate) {
      var first = firstWhere(arr, predicate);
      return !!first;
   }

   window.DependencyChain = DependencyChain;
}(window));