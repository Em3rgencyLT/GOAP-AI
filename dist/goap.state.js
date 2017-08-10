var creepBody = require('creep.body');
var constants = require('goap.constants').constants;

var goapState = function (name, value) {
    this.name = name;
    this.value = value;
}

var areConditionsMet = function(desiredStateArr, currentStateArr) {
    var allConditionsMet = true;
    _.every(desiredStateArr, function(desiredState) {
        var foundValue = false;
        var thisConditionMet = false;
        _.every(currentStateArr, function(currentState){
            if(desiredState.name == currentState.name) {
                foundValue = true;
                if(desiredState.value === currentState.value) {
                    thisConditionMet = true;
                    return false;
                }
            }
			return true;
        });

        //if a value is false, it's often ommited. If the requirement is that a value is false if it wasn't found means that its false.
        if(!foundValue && desiredState.value == false) {
            thisConditionMet = true;
        }

        if(!thisConditionMet) {
            allConditionsMet = false;
            return false;
        }
		
		return true;
    });
    return allConditionsMet;
}

var getRoomStateArr = function(room) {
    var stateArr = [];

    if(room.energyAvailable === room.energyCapacityAvailable) {
        stateArr.push(new goapState(constants.STATE_SPAWN_AND_EXTENSION_ENERGY_FULL, true));
    }

    if(room.energyAvailable >= creepBody.getCheapestWorkerCost()) {
        stateArr.push(new goapState(constants.STATE_ROOM_HAS_ENOUGH_ENERGY_FOR_A_WORKER, true));
    }
	
	if(room.energyAvailable > 0) {
        stateArr.push(new goapState(constants.STATE_ROOM_HAS_ENERGY, true));
    }

    var checkHasWorker = true;
    var checkHasHarvestingSource = true;
    _.every(room.find(FIND_MY_CREEPS), function(creep) {
        if(checkHasWorker && creep.getActiveBodyparts(MOVE) > 0 && creep.getActiveBodyparts(CARRY) > 0 && creep.getActiveBodyparts(WORK) > 0) {
			//console.log('Time: ' + Game.time + ' adding worker state.');
            stateArr.push(new goapState(constants.STATE_ROOM_HAS_A_WORKER, true));
            checkHasWorker = false;
        }

        //we don't care if a creep is mining energy for this condition, we care if energy is actually getting deposited
        if(checkHasHarvestingSource && creep.memory.plan.includes(constants.ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION)) {
            stateArr.push(new goapState(constants.STATE_ROOM_HAS_ACTORS_HARVESTING_ENERGY, true));
            checkHasHarvestingSource = false;
        }

        if(checkHasWorker || checkHasHarvestingSource) {
            return true;
        } else {
            return false;
        }
    });

    if(room.find(FIND_SOURCES).length) {
        stateArr.push(new goapState(constants.STATE_ROOM_HAS_A_SOURCE, true));
    }
	
	if(room.controller && room.controller.level < 8) {
		stateArr.push(new goapState(constants.STATE_ROOM_CONTROLLER_IS_MAX_LEVEL, false));
	} else {
		stateArr.push(new goapState(constants.STATE_ROOM_CONTROLLER_IS_MAX_LEVEL, true));
	}

    return stateArr;
}

var getCreepStateArr = function(creep) {
    var stateArr = [];
	
	stateArr.push(new goapState(constants.STATE_ACTOR_IS_SPAWN, false));

    var moveParts = _.filter(creep.body, function(bodyPart) {
        return bodyPart.type === MOVE;
    });
    var carryParts = _.filter(creep.body, function(bodyPart) {
        return bodyPart.type === CARRY;
    });
    var workParts = _.filter(creep.body, function(bodyPart) {
        return bodyPart.type === WORK;
    });

    if(moveParts.length) {
        stateArr.push(new goapState(constants.STATE_ACTOR_HAS_MOVE, true));
    }
    if(carryParts.length) {
        stateArr.push(new goapState(constants.STATE_ACTOR_HAS_CARRY, true));
    }
    if(workParts.length) {
        stateArr.push(new goapState(constants.STATE_ACTOR_HAS_WORK, true));
    }
    if(creep.carry.energy === creep.carryCapacity) {
        stateArr.push(new goapState(constants.STATE_ACTOR_FULL_ENERGY, true));
    }
    if(creep.carry.energy === 0) {
        stateArr.push(new goapState(constants.STATE_ACTOR_NO_ENERGY, true));
    }

    return stateArr;
}

var getSpawnStateArr = function(creep) {
    var stateArr = [];
	
	stateArr.push(new goapState(constants.STATE_ACTOR_IS_SPAWN, true));

    return stateArr;
}

var containsIdenticalState = function(stateArr, needle) {
	var found = false;
	_.every(stateArr, function(state){
		if (state.name == needle.name && state.value == needle.value) {
			found = true;
			return false;
		}
		return true;
	});
	
	return found;
}

var stateArraysAreIdentical = function (firstArr, secondArr) {
    if (firstArr.length !== secondArr.length) {
        return false;
    }

    var identical = true;
    _.every(firstArr, function(firstElement) {
        var copy = _.filter(secondArr, function(secondElement) {
            return secondElement.name === firstElement.name && secondElement.value === firstElement.value
        });
        if(copy.length > 0) {
            return true;
        } else {
            identical = false;
            return false;
        }

    });
    return identical;
}

module.exports = {
    state : goapState,
    areConditionsMet : areConditionsMet,
    getRoomStateArr : getRoomStateArr,
    getCreepStateArr : getCreepStateArr,
	getSpawnStateArr : getSpawnStateArr,
	containsIdenticalState : containsIdenticalState,
    stateArraysAreIdentical : stateArraysAreIdentical
}