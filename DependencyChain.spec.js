describe('DependencyChain', function () {
   var dc;

   beforeEach(function () {
      dc = new DependencyChain();
   });

   describe('add()', function () {
      var vertex,
         fn;

      beforeEach(function () {
         fn = function (foo) {
            foo += 'bar'
         };
         vertex = dc.add('name', fn, ['dep1', 'dep2']);
      });

      it('should return a vertex', function () {
         expect(vertex.name).toBe('name');
         expect(vertex.connections.length).toBe(2);
         expect(vertex.value).toBe(fn);
      });
   });

   describe('when there are no circular dependencies', function () {
      beforeEach(function () {
         dc.add('dep1', function (dep2, dep3) {
         }, ['dep2', 'dep3']);
         dc.add('dep2', function (dep4) {
         }, ['dep4']);
         dc.add('dep3', function () {
         }, []);
         dc.add('dep4', function () {
         }, []);
      });

      describe('prioritized()', function () {
         var result;

         beforeEach(function () {
            result = dc.prioritized();
         });

         it('should return a prioritized array of dependencies', function () {
            expect(result[0].name).toBe('dep4');
            expect(result[1].name).toBe('dep2');
            expect(result[2].name).toBe('dep3');
            expect(result[3].name).toBe('dep1');
         });
      });
   });

   describe('where there ARE circular dependencies', function (){
      beforeEach(function() {
         dc.add('dep1', function(dep2){}, ['dep2']);
         dc.add('dep2', function(dep3){}, ['dep3']);
         dc.add('dep3', function(dep1, dep2){}, ['dep1', 'dep2']);
      });

      describe('prioritized()', function (){
         it('should throw an error', function (){
            expect(dc.prioritized).toThrow(new Error('Circular dependencies detected'));
         });
      })
   })
});