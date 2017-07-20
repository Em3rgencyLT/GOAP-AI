var goapState = require('goap.state');

var constants = {
    ACTION_FIND_ACTIVE_SOURCE : 'findActiveSource',
    ACTION_HARVEST_SOURCE : 'harvestSource',
    ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION : 'depositEnergyToSpawnOrExtension',
    ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION : 'findNonFullSpawnOrExtension'
}

function findActiveSourceAction() {
    this.preconditions = [];
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
    this.cost = 1;
    this.name = constants.ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION;
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

function depositEnergyToSpawnOrExtensionAction() {
    this.preconditions = [
        new goapState.state(goapState.const.STATE_ACTOR_FOUND_NON_FULL_SPAWN_OR_EXTENSION, true),
        new goapState.state(goapState.const.STATE_ACTOR_NO_ENERGY, false),
        new goapState.state(goapState.const.STATE_ACTOR_HAS_CARRY, true),
        new goapState.state(goapState.const.STATE_ACTOR_HAS_WORK, true)
    ];
    this.postconditions = [
        new goapState.state(goapState.const.STATE_ACTOR_NO_ENERGY, true),
        new goapState.state(goapState.const.STATE_SPAWN_AND_EXTENSION_ENERGY_FULL, true)
    ];
    this.cost = 1;
    this.name = constants.ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION;
}

var getAllActionNames = function() {
    var actionNames = [];
    _.each(constants, function(action) {
        actionNames.push(action);
    });
    return actionNames;
}

var applyActionToState = function(stateArr, actionName) {
    var action = new actions[actionName]();
    if(!goapState.areConditionsMet(action.preconditions, stateArr)) {
        return false;
    }

    var newStateArr = stateArr;
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
actions[constants.ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION] = findNonFullSpawnOrExtensionAction;
actions[constants.ACTION_HARVEST_SOURCE] = harvestSourceAction;
actions[constants.ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION] = depositEnergyToSpawnOrExtensionAction;

module.exports = {
    const : constants,
    actions : actions,
    getAllActionNames : getAllActionNames,
    applyActionToState : applyActionToState
}