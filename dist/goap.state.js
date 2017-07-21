var constants = {
    STATE_ACTOR_HAS_MOVE : 'actorHasMove',
    STATE_ACTOR_HAS_CARRY : 'actorHasCarry',
    STATE_ACTOR_HAS_WORK : 'actorHasWork',
    STATE_ACTOR_NO_ENERGY : 'actorNoEnergy',
    STATE_ACTOR_FULL_ENERGY : 'actorFullEnergy',
    STATE_SPAWN_AND_EXTENSION_ENERGY_FULL : 'spawnAndExtensionEnergyFull',
    STATE_ACTOR_FOUND_ACTIVE_SOURCE : 'actorFoundActiveSource',
    STATE_ACTOR_FOUND_NON_FULL_SPAWN_OR_EXTENSION : 'actorFoundNonFullSpawnOrExtension',
    STATE_ROOM_HAS_A_WORKER : 'roomHasAWorker',
    STATE_ROOM_HAS_ENOUGH_ENERGY_FOR_A_WORKER : 'roomHasEnoughEnergyForAWorker'
}

var goapState = function (name, value) {
    this.name = name;
    this.value = value;
}

var areConditionsMet = function(desiredStateArr, currentStateArr) {
    var allConditionsMet = true;
    _.each(desiredStateArr, function(desiredState) {
        var foundValue = false;
        var thisConditionMet = false;
        _.each(currentStateArr, function(currentState){
            if(desiredState.name == currentState.name) {
                foundValue = true;
                if(desiredState.value === currentState.value) {
                    thisConditionMet = true;
                    return;
                }
            }
        });

        //if a value is false, it's often ommited. If the requirement is that a value is false if it wasn't found means that its false.
        if(!foundValue && desiredStateArr.value == false) {
            thisConditionMet = true;
        }

        if(!foundValue || !thisConditionMet) {
            allConditionsMet = false;
            return;
        }
    });
    console.log("Plan condition check: " + allConditionsMet);
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

    _.each(room.find(FIND_MY_CREEPS), function(creep) {
        if(creep.getActiveBodyparts(MOVE) > 0 && creep.getActiveBodyparts(CARRY) > 0 && creep.getActiveBodyparts(WORK) > 0) {
            stateArr.push(new goapState(constants.STATE_ROOM_HAS_A_WORKER, true));
            return;
        }
    });

    return stateArr;
}

var getCreepStateArr = function(creep) {
    var stateArr = [];

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
    if(creep.memory.activeSource) {
        var activeSource = Game.getObjectById(creep.memory.activeSource);
        if(activeSource && activeSource instanceof Source && activeSource.energy > 0) {
            stateArr.push(new goapState(constants.STATE_ACTOR_FOUND_ACTIVE_SOURCE, true));
        }
    }
    if(creep.memory.nonFullSpawnOrExtension) {
        var nonFullSpawnOrExtension = Game.getObjectById(creep.memory.nonFullSpawnOrExtension);
        if(nonFullSpawnOrExtension && (nonFullSpawnOrExtension instanceof StructureSpawn || nonFullSpawnOrExtension instanceof StructureExtension) && nonFullSpawnOrExtension.energy < nonFullSpawnOrExtension.energyCapacity) {
            stateArr.push(new goapState(constants.STATE_ACTOR_FOUND_NON_FULL_SPAWN_OR_EXTENSION, true));
        }
    }

    return stateArr;
}

module.exports = {
    state : goapState,
    const : constants,
    areConditionsMet : areConditionsMet,
    getRoomStateArr : getRoomStateArr,
    getCreepStateArr : getCreepStateArr
}