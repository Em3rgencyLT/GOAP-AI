var goapState = require('goap.state');

var constants = {
    ACTION_FIND_ACTIVE_SOURCE : 'findActiveSource',
    ACTION_HARVEST_SOURCE : 'harvestSource',
	ACTION_WITHDRAW_ENERGY_FROM_SPAWN_OR_EXTENSION: 'withdrawEnergyFromSpawnOrExtension',
    ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION : 'depositEnergyToSpawnOrExtension',
    ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION : 'findNonFullSpawnOrExtension',
	ACTION_FIND_NON_EMPTY_SPAWN_OR_EXTENSION : 'findNonEmptySpawnOrExtension',
    ACTION_BUILD_WORKER: 'buildWorker',
	ACTION_UPGRADE_CONTROLLER: 'upgradeController',
}

function findActiveSourceAction() {
    this.preconditions = [
		new goapState.state(goapState.const.STATE_ACTOR_FULL_ENERGY, false),
	];
    this.postconditions = [
        new goapState.state(goapState.const.STATE_ACTOR_FOUND_ACTIVE_SOURCE, true)
    ];
    this.cost = 1;
    this.name = constants.ACTION_FIND_ACTIVE_SOURCE;
}

function findNonFullSpawnOrExtensionAction() {
    this.preconditions = [];
    this.postconditions = [
        new goapState.state(goapState.const.STATE_ACTOR_FOUND_NON_FULL_SPAWN_OR_EXTENSION, true)
    ];
    this.cost = 3;
    this.name = constants.ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION;
}

function findNonEmptySpawnOrExtensionAction() {
    this.preconditions = [];
    this.postconditions = [
        new goapState.state(goapState.const.STATE_ACTOR_FOUND_NON_EMPTY_SPAWN_OR_EXTENSION, true)
    ];
    this.cost = 3;
    this.name = constants.ACTION_FIND_NON_EMPTY_SPAWN_OR_EXTENSION;
}


function harvestSourceAction() {
    this.preconditions = [
        new goapState.state(goapState.const.STATE_ACTOR_FOUND_ACTIVE_SOURCE, true),
        new goapState.state(goapState.const.STATE_ACTOR_FULL_ENERGY, false),
        new goapState.state(goapState.const.STATE_ACTOR_HAS_CARRY, true),
        new goapState.state(goapState.const.STATE_ACTOR_HAS_WORK, true)
    ];
    this.postconditions = [
        new goapState.state(goapState.const.STATE_ACTOR_NO_ENERGY, false),
        new goapState.state(goapState.const.STATE_ACTOR_FULL_ENERGY, true)
    ];
    this.cost = 1;
    this.name = constants.ACTION_HARVEST_SOURCE;
}

function withdrawEnergyFromSpawnOrExtensionAction() {
    this.preconditions = [
		new goapState.state(goapState.const.STATE_ACTOR_FOUND_NON_EMPTY_SPAWN_OR_EXTENSION, true),
        new goapState.state(goapState.const.STATE_ROOM_HAS_ENERGY, true),
        new goapState.state(goapState.const.STATE_ACTOR_FULL_ENERGY, false),
        new goapState.state(goapState.const.STATE_ACTOR_HAS_CARRY, true),
        new goapState.state(goapState.const.STATE_ACTOR_HAS_WORK, true)
    ];
    this.postconditions = [
        new goapState.state(goapState.const.STATE_ACTOR_NO_ENERGY, false),
        new goapState.state(goapState.const.STATE_ACTOR_FULL_ENERGY, true),
		new goapState.state(goapState.const.STATE_ROOM_HAS_ENERGY, false),
		new goapState.state(goapState.const.STATE_ROOM_HAS_ENOUGH_ENERGY_FOR_A_WORKER, false),
        new goapState.state(goapState.const.STATE_SPAWN_AND_EXTENSION_ENERGY_FULL, false)
    ];
    this.cost = 2;
    this.name = constants.ACTION_WITHDRAW_ENERGY;
}

function depositEnergyToSpawnOrExtensionAction() {
    this.preconditions = [
        new goapState.state(goapState.const.STATE_ACTOR_FOUND_NON_FULL_SPAWN_OR_EXTENSION, true),
        new goapState.state(goapState.const.STATE_ACTOR_NO_ENERGY, false),
        new goapState.state(goapState.const.STATE_ACTOR_HAS_CARRY, true),
        new goapState.state(goapState.const.STATE_ACTOR_HAS_WORK, true)
    ];
    this.postconditions = [
        new goapState.state(goapState.const.STATE_ACTOR_NO_ENERGY, true),
		new goapState.state(goapState.const.STATE_ACTOR_FULL_ENERGY, false),
		new goapState.state(goapState.const.STATE_ROOM_HAS_ENERGY, true),
		new goapState.state(goapState.const.STATE_ROOM_HAS_ENOUGH_ENERGY_FOR_A_WORKER, true),
        new goapState.state(goapState.const.STATE_SPAWN_AND_EXTENSION_ENERGY_FULL, true)
    ];
    this.cost = 2;
    this.name = constants.ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION;
}

function buildWorker() {
    this.preconditions = [
        new goapState.state(goapState.const.STATE_ROOM_HAS_ENOUGH_ENERGY_FOR_A_WORKER, true),
		new goapState.state(goapState.const.STATE_ACTOR_IS_SPAWN, true)
    ];
    this.postconditions = [
        new goapState.state(goapState.const.STATE_ROOM_HAS_A_WORKER, true)
    ];
    this.cost = 1;
    this.name = constants.ACTION_BUILD_WORKER;
}

function upgradeController() {
    this.preconditions = [
		new goapState.state(goapState.const.STATE_ACTOR_NO_ENERGY, false),
		new goapState.state(goapState.const.STATE_ROOM_CONTROLLER_IS_MAX_LEVEL, false),
		new goapState.state(goapState.const.STATE_ACTOR_HAS_CARRY, true),
        new goapState.state(goapState.const.STATE_ACTOR_HAS_WORK, true)
    ];
    this.postconditions = [
		new goapState.state(goapState.const.STATE_ACTOR_NO_ENERGY, true),
		new goapState.state(goapState.const.STATE_ACTOR_FULL_ENERGY, false),
        new goapState.state(goapState.const.STATE_ROOM_CONTROLLER_IS_MAX_LEVEL, true),
    ];
    this.cost = 1;
    this.name = constants.ACTION_UPGRADE_CONTROLLER;
}

var getAllActionNames = function() {
    var actionNames = [];
    _.each(constants, function(action) {
        actionNames.push(action);
    });
    return actionNames;
}

var getPossibleActionNames = function(currentStateArr) {
    var actionNames = [];
    _.each(actions, function(constructor, name) {
        var action = new constructor();
        if(goapState.areConditionsMet(action.preconditions, currentStateArr)) {
            actionNames.push(name);
        }
    });

    return actionNames;
}

var applyActionToState = function(stateArr, actionName) {
    var action = new actions[actionName]();
    if(!goapState.areConditionsMet(action.preconditions, stateArr)) {
        return false;
    }

    //clone the array
    var newStateArr = JSON.parse(JSON.stringify(stateArr));;
    _.each(action.postconditions, function(stateToAdd) {
        var found = false;
        _.each(newStateArr, function(stateToCheck) {
            if(stateToCheck.name === stateToAdd.name) {
                stateToCheck.value = stateToAdd.value;
                found = true;
                return;
            }
        });
        if(!found) {
            newStateArr.push(stateToAdd);
        }
    });

    return newStateArr;
}

var actions = {};
actions[constants.ACTION_FIND_ACTIVE_SOURCE] = findActiveSourceAction;
actions[constants.ACTION_FIND_NON_EMPTY_SPAWN_OR_EXTENSION] = findNonEmptySpawnOrExtensionAction;
actions[constants.ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION] = findNonFullSpawnOrExtensionAction;
actions[constants.ACTION_HARVEST_SOURCE] = harvestSourceAction;
actions[constants.ACTION_WITHDRAW_ENERGY_FROM_SPAWN_OR_EXTENSION] = withdrawEnergyFromSpawnOrExtensionAction;
actions[constants.ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION] = depositEnergyToSpawnOrExtensionAction;
actions[constants.ACTION_BUILD_WORKER] = buildWorker;
actions[constants.ACTION_UPGRADE_CONTROLLER] = upgradeController;

module.exports = {
    const : constants,
    actions : actions,
    getAllActionNames : getAllActionNames,
    getPossibleActionNames: getPossibleActionNames,
    applyActionToState : applyActionToState
}