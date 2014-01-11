DependencyChain.js

MIT license

======

A class for sorting dependencies and detecting circular references.

Will throw an error if circular dependencies are detected.

Usage:

    var dc = new DependencyChain();

    // add a few dependencies
    //      name   function        depends on
    dc.add('dep1', dependency1, ['dep2', 'dep3']);
    dc.add('dep2', dependency2, ['dep3']);
    dc.add('dep3', dependency3, []);

    function dependency1(dep2, dep3) {
       // do stuff
    }

    function dependency2(dep3) {
       // more stuff
    }

    function dependency3() {
       // things here
    }

    // Now we can get them out prioritized
    // this will error if circular dependencies are detected.
    var priorityList = dc.prioritized();
    console.log(priorityList);
