var goapState = require('goap.state');
var goapAction = require('goap.action');

var formulatePlan = function(startStateArr, desiredStateArr, allowedActionsArr) {
    var plan = [];

    var currentStateArr = startStateArr;
    var foundPlan = false;
    _.each(allowedActionsArr, function(actionName, index) {
        if(actionName === undefined) {
            return;
        }
        var result = goapAction.applyActionToState(currentStateArr, actionName);
        if(result !== false) {
            plan.push(actionName);
            currentStateArr = result;
            var conditionsAreMet = goapState.areConditionsMet(desiredStateArr, currentStateArr);
            if(conditionsAreMet) {
                foundPlan = true;
                return;
            } else {
                var newAllowedActions = allowedActionsArr;
                newAllowedActions.splice(index, 1);
                if(newAllowedActions.length >= 1) {
                    var recursivePlanResult = formulatePlan(currentStateArr, desiredStateArr, newAllowedActions);
                    if(recursivePlanResult !== false) {
                        plan = plan.concat(recursivePlanResult);
                        foundPlan = true;
                        return;
                    }
                }
            }
        }
    });

    if(foundPlan) {
        return plan;
    } else {
        return false;
    }
}

var wipePlan = function(creep) {
    creep.memory.activeSource = undefined;
    creep.memory.nonFullSpawnOrExtension = undefined;

    creep.memory.plan = [];
    creep.memory.desiredState = [];
}

module.exports = {
    formulatePlan : formulatePlan,
    wipePlan : wipePlan
}