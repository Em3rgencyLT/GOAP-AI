var goapAction = require('goap.action');
var creepBody = require('creep.body');

var findActiveSourceExecution = function (creep) {
    if(creep.memory.plan[0] !== goapAction.const.ACTION_FIND_ACTIVE_SOURCE) {
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

var findNonFullSpawnOrExtensionExecution = function(creep) {
    if(creep.memory.plan[0] !== goapAction.const.ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION) {
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
    if(creep.memory.plan[0] !== goapAction.const.ACTION_FIND_NON_EMPTY_SPAWN_OR_EXTENSION) {
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
    if(creep.memory.plan[0] !== goapAction.const.ACTION_HARVEST_SOURCE) {
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
    if(creep.memory.plan[0] !== goapAction.const.ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION) {
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
    if(creep.memory.plan[0] !== goapAction.const.ACTION_WITHDRAW_ENERGY_FROM_SPAWN_OR_EXTENSION) {
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
    var result = spawn.createCreep(creepBody.WORKER_TIER_I.body);
    if(_.isString(result)) {
        spawn.memory.plan.shift();
        return;
    } else {
        wipePlan(spawn);
    }
}

var wipePlan = function(object) {
    object.memory.activeSource = undefined;
    object.memory.nonFullSpawnOrExtension = undefined;

    object.memory.plan = [];
    object.memory.desiredState = [];
}

var executions = {};
executions[goapAction.const.ACTION_FIND_ACTIVE_SOURCE] = findActiveSourceExecution;
executions[goapAction.const.ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION] = findNonFullSpawnOrExtensionExecution;
executions[goapAction.const.ACTION_FIND_NON_EMPTY_SPAWN_OR_EXTENSION] = findNonEmptySpawnOrExtensionExecution;
executions[goapAction.const.ACTION_HARVEST_SOURCE] = harvestSourceExecution;
executions[goapAction.const.ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION] = depositEnergyToSpawnOrExtensionExecution;
executions[goapAction.const.ACTION_WITHDRAW_ENERGY_FROM_SPAWN_OR_EXTENSION] = withdrawEnergyFromSpawnOrExtensionExecution;
executions[goapAction.const.ACTION_BUILD_WORKER] = buildWorker;

module.exports = {
    executions : executions,
}