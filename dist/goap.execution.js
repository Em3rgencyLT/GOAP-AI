var creepBody = require('creep.body');
var miscelaneous = require('miscelaneous');
var constants = require('goap.constants').constants;

var findActiveSourceExecution = function (creep) {
    if(creep.memory.plan[0] !== constants.ACTION_FIND_ACTIVE_SOURCE) {
        Game.notify(creep + " is in findActiveSourceExecution, when plan is " + creep.memory.plan);
        console.log(creep + " is in findActiveSourceExecution, when plan is " + creep.memory.plan);
        return;
    }

    var activeSource = Game.getObjectById(creep.memory.activeSource);

    if(!activeSource || !(activeSource instanceof Source) || activeSource.energy === 0) {
        var activeSources = creep.room.find(FIND_SOURCES_ACTIVE);
        activeSource = creep.pos.findClosestByPath(activeSources);
        if(!activeSource) {
            wipePlan(creep);
            return;
        } else {
            creep.memory.activeSource = activeSource.id;
        }
    }

    if(creep.pos.isNearTo(activeSource)) {
        creep.memory.plan.shift();
        return;
    } else {
        creep.moveTo(activeSource);
        //TODO if can't moveTo, should find different source
    }
}

var findActiveNonFullyTappedSourceExecution = function (creep) {
    var activeSource = Game.getObjectById(creep.memory.activeSource);

    if(!activeSource || !(activeSource instanceof Source) || activeSource.energy === 0) {
        var activeSources = creep.room.find(FIND_SOURCES_ACTIVE);
        var nonTappedActiveSources = [];
        _.each(activeSources, function(source) {
            var needsWorkParts = miscelaneous.getSourceMaxWorkPartCount(source);
            var hasWorkParts = miscelaneous.getSourceWorkPartCount(source);
            if(hasWorkParts < needsWorkParts) {
                nonTappedActiveSources.push(source);
            }
        });
        activeSource = creep.pos.findClosestByPath(nonTappedActiveSources);
        if(!activeSource) {
            wipePlan(creep);
            return;
        } else {
            creep.memory.activeSource = activeSource.id;
        }
    }

    if(creep.pos.isNearTo(activeSource)) {
        creep.memory.plan.shift();
        return;
    } else {
        creep.moveTo(activeSource);
        //TODO if can't moveTo, should find different source
    }
}

var findNonFullSpawnOrExtensionExecution = function(creep) {
    if(creep.memory.plan[0] !== constants.ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION) {
        Game.notify(creep + " is in findNonFullSpawnOrExtensionExecution, when plan is " + creep.memory.plan);
        console.log(creep + " is in findNonFullSpawnOrExtensionExecution, when plan is " + creep.memory.plan);
        return;
    }

    var nonFullSpawnOrExtension = Game.getObjectById(creep.memory.nonFullSpawnOrExtension);

    if(!nonFullSpawnOrExtension || (!(nonFullSpawnOrExtension instanceof StructureSpawn) && !(nonFullSpawnOrExtension instanceof StructureExtension)) || nonFullSpawnOrExtension.energy === nonFullSpawnOrExtension.energyCapacity) {
        var nonFullSpawnOrExtensions = creep.room.find(FIND_MY_STRUCTURES, {filter : function(structure) {
            return (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
        }});
        nonFullSpawnOrExtension = creep.pos.findClosestByPath(nonFullSpawnOrExtensions);
        if(!nonFullSpawnOrExtension) {
            wipePlan(creep);
            return;
        } else {
			creep.memory.nonFullSpawnOrExtension = nonFullSpawnOrExtension.id;
		}
    }

    if(creep.pos.isNearTo(nonFullSpawnOrExtension)) {
        creep.memory.plan.shift();
        return;
    } else {
        creep.moveTo(nonFullSpawnOrExtension);
		//TODO if can't moveTo, should find different source
    }
}

var findNonEmptySpawnOrExtensionExecution = function(creep) {
    if(creep.memory.plan[0] !== constants.ACTION_FIND_NON_EMPTY_SPAWN_OR_EXTENSION) {
        Game.notify(creep + " is in findNonEmptySpawnOrExtensionExecution, when plan is " + creep.memory.plan);
        console.log(creep + " is in findNonEmptySpawnOrExtensionExecution, when plan is " + creep.memory.plan);
        return;
    }

    var nonEmptySpawnOrExtension = Game.getObjectById(creep.memory.nonEmptySpawnOrExtension);

    if(!nonEmptySpawnOrExtension || (!(nonEmptySpawnOrExtension instanceof StructureSpawn) && !(nonEmptySpawnOrExtension instanceof StructureExtension)) || nonEmptySpawnOrExtension.energy === 0) {
        var nonEmptySpawnOrExtensions = creep.room.find(FIND_MY_STRUCTURES, {filter : function(structure) {
            return (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION) && structure.energy > 0;
        }});
        nonEmptySpawnOrExtension = creep.pos.findClosestByPath(nonEmptySpawnOrExtensions);
        if(!nonEmptySpawnOrExtension) {
            wipePlan(creep);
            return;
        } else {
			creep.memory.nonEmptySpawnOrExtension = nonEmptySpawnOrExtension.id;
		}
    }

    if(creep.pos.isNearTo(nonEmptySpawnOrExtension)) {
        creep.memory.plan.shift();
        return;
    } else {
        creep.moveTo(nonEmptySpawnOrExtension);
		//TODO if can't moveTo, should find different source
    }
}

var harvestSourceExecution = function(creep) {
    if(creep.memory.plan[0] !== constants.ACTION_HARVEST_SOURCE) {
        Game.notify(creep + " is in harvestSourceExecution, when plan is " + creep.memory.plan);
        console.log(creep + " is in harvestSourceExecution, when plan is " + creep.memory.plan);
        return;
    }

    var source = Game.getObjectById(creep.memory.activeSource);
    var result = creep.harvest(source);

    switch(result) {
        case OK:
			//need to stop 1 tick earlier to leave full and not waste any
            if(_.sum(creep.carry) + creep.memory.bodyCounts[WORK]*HARVEST_POWER === creep.carryCapacity) {
                creep.memory.plan.shift();
            }
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            creep.memory.activeSource = undefined;
			creep.memory.plan.shift();
            break;
        default:
            wipePlan(creep);
            break;
    }
}

var depositEnergyToSpawnOrExtensionExecution = function(creep) {
    if(creep.memory.plan[0] !== constants.ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION) {
        Game.notify(creep + " is in depositEnergyToSpawnOrExtensionExecution, when plan is " + creep.memory.plan);
        console.log(creep + " is in depositEnergyToSpawnOrExtensionExecution, when plan is " + creep.memory.plan);
        return;
    }

    var nonFullSpawnOrExtension = Game.getObjectById(creep.memory.nonFullSpawnOrExtension);

    var result = creep.transfer(nonFullSpawnOrExtension, RESOURCE_ENERGY);

    switch(result) {
        case OK:
            creep.memory.plan.shift();
            return;
            break;
        default:
            wipePlan(creep);
            break;
    }
}

var withdrawEnergyFromSpawnOrExtensionExecution = function(creep) {
    if(creep.memory.plan[0] !== constants.ACTION_WITHDRAW_ENERGY_FROM_SPAWN_OR_EXTENSION) {
        Game.notify(creep + " is in withdrawEnergyFromSpawnOrExtensionExecution, when plan is " + creep.memory.plan);
        console.log(creep + " is in withdrawEnergyFromSpawnOrExtensionExecution, when plan is " + creep.memory.plan);
        return;
    }

    var nonEmptySpawnOrExtension = Game.getObjectById(creep.memory.nonEmptySpawnOrExtension);

    var result = creep.withdraw(nonEmptySpawnOrExtension, RESOURCE_ENERGY);

    switch(result) {
        case OK:
            creep.memory.plan.shift();
            return;
            break;
        default:
            wipePlan(creep);
            break;
    }
}

var buildWorker = function(spawn) {
    var body = creepBody.getBestBody(spawn.room.energyAvailable, creepBody.const.BODY_TYPE_WORKER).body;
    var result = spawn.createCreep(body);
    switch(result) {
        case _.isString(result):
            spawn.memory.plan.shift();
            break;
        case ERR_NOT_ENOUGH_ENERGY:
        case ERR_BUSY:
            break;
        default:
            wipePlan(spawn);
            break;

    }
}

var upgradeController = function (creep) {
    if(creep.room.controller) {
        var result = creep.upgradeController(creep.room.controller);
        switch(result) {
            case OK:
                if(_.sum(creep.carry.energy === creep.memory.bodyCounts[WORK]*UPGRADE_CONTROLLER_POWER) ) {
                    creep.memory.plan.shift();
                }
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(creep.room.controller);
                break;
            default:
                wipePlan(creep);
                break;
        }
    }
}

var wipePlan = function(object) {
    object.memory.activeSource = undefined;
    object.memory.nonFullSpawnOrExtension = undefined;

    object.memory.plan = [];
    object.memory.desiredState = [];
}

var executions = {};
executions[constants.ACTION_FIND_ACTIVE_SOURCE] = findActiveSourceExecution;
executions[constants.ACTION_FIND_ACTIVE_NON_FULLY_TAPPED_SOURCE] = findActiveNonFullyTappedSourceExecution;
executions[constants.ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION] = findNonFullSpawnOrExtensionExecution;
executions[constants.ACTION_FIND_NON_EMPTY_SPAWN_OR_EXTENSION] = findNonEmptySpawnOrExtensionExecution;
executions[constants.ACTION_HARVEST_SOURCE] = harvestSourceExecution;
executions[constants.ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION] = depositEnergyToSpawnOrExtensionExecution;
executions[constants.ACTION_WITHDRAW_ENERGY_FROM_SPAWN_OR_EXTENSION] = withdrawEnergyFromSpawnOrExtensionExecution;
executions[constants.ACTION_BUILD_WORKER] = buildWorker;
executions[constants.ACTION_UPGRADE_CONTROLLER] = upgradeController;

module.exports = {
    executions : executions,
    wipePlan: wipePlan
}