var goapState = require('goap.state');
var goapExecution = require('goap.execution');
var astarSearch = require('astar.search');
var creepBody = require('creep.body');

module.exports.loop = function () {
    updateMemory();

    console.log(creepBody.getBestBody(0).body.toString());

    _.each(Memory.rooms, function(room) {
        _.each(room.spawns, function(spawn) {
            var spawnObject = Game.spawns[spawn];
            if(spawnObject.memory.plan && spawnObject.memory.plan.length > 0) {
                executePlan(spawnObject);
            } else if (!spawnObject.spawning) {
                var desiredState = [
                    new goapState.state(goapState.const.STATE_ROOM_HAS_A_WORKER, true)
                ];

				var currentState = room.state.concat(spawnObject.memory.state);
                spawnObject.memory.plan = astarSearch.searchForPlan(currentState, desiredState);
            }
        });

        _.each(room.creeps, function(creep, index) {
            var creepObject = Game.creeps[creep];

            if(creepObject.memory.plan && creepObject.memory.plan.length > 0) {
				//console.log(creepObject.name + " is executing a plan.");
                executePlan(creepObject);
            } else {
				if(index % 2 == 0) {
					var desiredState = [
						new goapState.state(goapState.const.STATE_SPAWN_AND_EXTENSION_ENERGY_FULL, true)
					];
				} else {
					var desiredState = [
						new goapState.state(goapState.const.STATE_ROOM_CONTROLLER_IS_MAX_LEVEL, true)
					];
				}

                var currentState = room.state.concat(creepObject.memory.state);

                //console.log(creepObject.name + " is formulating a plan.");
                creepObject.memory.plan = astarSearch.searchForPlan(currentState, desiredState);
            }
        });
    });
}

function updateMemory() {
    Memory.rooms = {};
    _.each(Game.rooms, function(room) {
        Memory.rooms[room.name] = {}
        Memory.rooms[room.name].state = goapState.getRoomStateArr(room);
        Memory.rooms[room.name].spawns = [];
        Memory.rooms[room.name].creeps = [];
    });
	
	_.each(Game.creeps, function(creep) {
		creep.memory.state = goapState.getCreepStateArr(creep);
		Memory.rooms[creep.room.name].creeps.push(creep.name);
		if(!creep.memory.bodyCounts) {
			creep.memory.bodyCounts = {};
			creep.memory.bodyCounts[WORK] = 0;
			creep.memory.bodyCounts[MOVE] = 0;
			creep.memory.bodyCounts[CARRY] = 0;
			_.each(creep.body, function(body) {
				creep.memory.bodyCounts[body.type] += 1;
			});
		}
	});
	
	_.each(Game.spawns, function(spawn) {
		spawn.memory.state = goapState.getSpawnStateArr(spawn);
		Memory.rooms[spawn.room.name].spawns.push(spawn.name);
	});

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}

function executePlan(object) {
    if(object.memory.plan && object.memory.plan.length > 0) {
        var functionName = object.memory.plan[0];
        goapExecution.executions[functionName](object);
		if(object.memory.plan.length === 0) {
			goapExecution.wipePlan(object);
		}
    } else {
        return;
    }

}