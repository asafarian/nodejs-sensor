
'use strict';

const AllocationSampler = require('../../lib/samplers/allocation_sampler').AllocationSampler;
const assert = require('assert');
const util = require('util');


describe('AllocationSampler', () => {
  let profiler;

  beforeEach(() => {
    profiler = global.profiler;
  });


  describe('startSampler()', () => {
    it('should record allocation profile', (done) => {
      if (!profiler.matchVersion('v8.6.0', null)) {
        done();
        return;
      }

      let sampler = new AllocationSampler(profiler);
      if (!sampler.test()) {
        done();
        return;
      }
      sampler.reset();

      sampler.startSampler();
      setTimeout(() => {
        sampler.stopSampler();
        let profile = sampler.buildProfile(1000, 10);

        // console.log(util.inspect(profile.toJson(), {showHidden: false, depth: null}))
        assert(JSON.stringify(profile.toJson()).match(/allocation_sampler.test.js/));
        done();
      }, 1000);


      let mem1 = [];
      function memLeak() {
        let mem2 = [];
        for (let i = 0; i < 200000; i++) {
          mem1.push(Math.random());
          mem2.push(Math.random());
        }
      }

      memLeak();
    });
  });
});


