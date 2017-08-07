var goapState = require('goap.state');
var goapAction = require('goap.action');
var goapPlan = require('goap.plan');
var goapExecution = require('goap.execution');
var astarSearch = require('astar.search');

module.exports.loop = function () {
    updateMemory();

    _.each(Memory.rooms, function(room) {
        _.each(room.spawns, function(spawn) {
            var spawnObject = Game.spawns[spawn];
            if(spawnObject.memory.plan && spawnObject.memory.plan.length > 0) {
                executePlan(spawnObject);
            } else {
                var desiredState = [
                    new goapState.state(goapState.const.STATE_ROOM_HAS_A_WORKER, true)
                ];
                var allowedActions = [
                    goapAction.const.ACTION_BUILD_WORKER
                ];
				var currentState = room.state.concat(spawnObject.memory.state);
				
                spawnObject.memory.plan = goapPlan.formulatePlan(currentState, desiredState, allowedActions);
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
                
                var allowedActions = goapAction.getAllActionNames();
                var currentState = room.state.concat(creepObject.memory.state);

                _.each(allowedActions, function(actionName){
                    var action = new goapAction.actions[actionName];
                    console.log(actionName + " " + astarSearch.calculateHeuristic(currentState, desiredState, action.postconditions));
                });

                //console.log(creepObject.name + " is formulating a plan.");
                creepObject.memory.plan = goapPlan.formulatePlan(currentState, desiredState, allowedActions);
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
			goapPlan.wipePlan(object);
		}
    } else {
        return;
    }

}