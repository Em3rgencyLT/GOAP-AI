var goapAction = require('goap.action');
var goapPlan = require('goap.plan');
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
            goapPlan.wipePlan(creep);
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
        nonFullSpawnOrExtension = creep.pos.findClosestByPath(nonFullSpawnOrExtension);
        if(!nonFullSpawnOrExtension) {
            goapPlan.wipePlan(creep);
            return;
        }
    }

    if(creep.pos.isNearTo(nonFullSpawnOrExtension)) {
        creep.memory.plan.shift();
        return;
    } else {
        creep.moveTo(nonFullSpawnOrExtension);
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
            if(_.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.plan.shift();
            }
            return;
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            creep.memory.activeSource = undefined;
            if (creep.carry.energy > 0) {
                creep.memory.plan.shift();
                return;
            }
            break;
        default:
            goapPlan.wipePlan(creep);
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
            goapPlan.wipePlan(creep);
            break;
    }
}

var buildWorker = function(spawn) {
    var result = spawn.createCreep(creepBody.WORKER_TIER_I.body);
    if(_.isString(result)) {
        spawn.memory.plan.shift();
        return;
    } else {
        goapPlan.wipePlan(spawn);
    }
}

var executions = {};
executions[goapAction.const.ACTION_FIND_ACTIVE_SOURCE] = findActiveSourceExecution;
executions[goapAction.const.ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION] = findNonFullSpawnOrExtensionExecution;
executions[goapAction.const.ACTION_HARVEST_SOURCE] = harvestSourceExecution;
executions[goapAction.const.ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION] = depositEnergyToSpawnOrExtensionExecution;
executions[goapAction.const.ACTION_BUILD_WORKER] = buildWorker;

module.exports = {
    executions : executions,
}