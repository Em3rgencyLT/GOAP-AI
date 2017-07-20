var constants = {
    STATE_ACTOR_HAS_MOVE : 'actorHasMove',
    STATE_ACTOR_HAS_CARRY : 'actorHasCarry',
    STATE_ACTOR_HAS_WORK : 'actorHasWork',
    STATE_ACTOR_NO_ENERGY : 'actorNoEnergy',
    STATE_ACTOR_FULL_ENERGY : 'actorFullEnergy',
    STATE_SPAWN_AND_EXTENSION_ENERGY_FULL : 'spawnAndExtensionEnergyFull',
    STATE_ACTOR_FOUND_ACTIVE_SOURCE : 'actorFoundActiveSource',
    STATE_ACTOR_FOUND_NON_FULL_SPAWN_OR_EXTENSION : 'actorFoundNonFullSpawnOrExtension'
}

var goapState = function (name, value) {
    this.name = name;
    this.value = value;
}

var areConditionsMet = function(desiredStateArr, currentStateArr) {
    var conditionsMet = true;
    _.each(desiredStateArr, function(requiredState) {
        var found = false;
        _.each(currentStateArr, function(currentState){
            if(requiredState.name === currentState.name) {
                found = true;
                if(requiredState.value !== currentState.value) {
                    conditionsMet = false;
                }
            }
        });

        if(!found && requiredState.value === false) {
            conditionsMet = true;
            return;
        }

        if(!conditionsMet || !found) {
            conditionsMet = false;
            return;
        }
    });

    return conditionsMet;
}

var getRoomStateArr = function(room) {
    var stateArr = [];

    if(room.energyAvailable === room.energyCapacityAvailable) {
        stateArr.push(new goapState(constants.STATE_SPAWN_AND_EXTENSION_ENERGY_FULL, true));
    }

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