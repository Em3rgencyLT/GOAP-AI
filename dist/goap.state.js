var constants = {
    STATE_ACTOR_HAS_MOVE : 'actorHasMove',
    STATE_ACTOR_HAS_CARRY : 'actorHasCarry',
    STATE_ACTOR_HAS_WORK : 'actorHasWork',
    STATE_ACTOR_NO_ENERGY : 'actorNoEnergy',
    STATE_ACTOR_FULL_ENERGY : 'actorFullEnergy',
    STATE_SPAWN_AND_EXTENSION_ENERGY_FULL : 'spawnAndExtensionEnergyFull',
    STATE_ACTOR_FOUND_ACTIVE_SOURCE : 'actorFoundActiveSource',
    STATE_ACTOR_FOUND_NON_FULL_SPAWN_OR_EXTENSION : 'actorFoundNonFullSpawnOrExtension',
	STATE_ACTOR_FOUND_NON_EMPTY_SPAWN_OR_EXTENSION : 'actorFoundNonEmptySpawnOrExtension',
    STATE_ROOM_HAS_A_WORKER : 'roomHasAWorker',
	STATE_ROOM_HAS_ENERGY: 'roomHasEnergy',
    STATE_ROOM_HAS_ENOUGH_ENERGY_FOR_A_WORKER : 'roomHasEnoughEnergyForAWorker',
	STATE_ACTOR_IS_SPAWN: 'actorIsSpawn',
	STATE_ROOM_CONTROLLER_IS_MAX_LEVEL: 'roomControllerIsMaxLevel',
}

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

    if(room.energyAvailable >= 250) {
        stateArr.push(new goapState(constants.STATE_ROOM_HAS_ENOUGH_ENERGY_FOR_A_WORKER, true));
    }
	
	if(room.energyAvailable > 0) {
        stateArr.push(new goapState(constants.STATE_ROOM_HAS_ENERGY, true));
    }

    _.every(room.find(FIND_MY_CREEPS), function(creep) {
        if(creep.getActiveBodyparts(MOVE) > 0 && creep.getActiveBodyparts(CARRY) > 0 && creep.getActiveBodyparts(WORK) > 0) {
			//console.log('Time: ' + Game.time + ' adding worker state.');
            stateArr.push(new goapState(constants.STATE_ROOM_HAS_A_WORKER, true));
            return false;
        }
		
		return true;
    });
	
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

module.exports = {
    state : goapState,
    const : constants,
    areConditionsMet : areConditionsMet,
    getRoomStateArr : getRoomStateArr,
    getCreepStateArr : getCreepStateArr,
	getSpawnStateArr : getSpawnStateArr,
	containsIdenticalState : containsIdenticalState,
}