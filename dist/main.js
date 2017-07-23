var goapState = require('goap.state');
var goapAction = require('goap.action');
var goapPlan = require('goap.plan');
var goapExecution = require('goap.execution');

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

        _.each(room.creeps, function(creep) {
            var creepObject = Game.creeps[creep];

            if(creepObject.memory.plan && creepObject.memory.plan.length > 0) {
				//console.log(creepObject.name + " is executing a plan.");
                executePlan(creepObject);
            } else {
                var desiredState = [
                    new goapState.state(goapState.const.STATE_SPAWN_AND_EXTENSION_ENERGY_FULL, true)
                ];
                var allowedActions = goapAction.getAllActionNames();
                var currentState = room.state.concat(creepObject.memory.state);

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
        _.each(Game.spawns, function(spawn) {
			spawn.memory.state = goapState.getSpawnStateArr(spawn);
            if(spawn.room.name === room.name) {
                Memory.rooms[room.name].spawns.push(spawn.name);
            }
        });
        _.each(Game.creeps, function(creep) {
            if(creep.room.name === room.name) {
                creep.memory.state = goapState.getCreepStateArr(creep);
                Memory.rooms[room.name].creeps.push(creep.name);
            }
        });
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