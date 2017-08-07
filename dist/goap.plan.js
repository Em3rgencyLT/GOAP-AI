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
			//console.log("Pushing " + actionName);
            plan.push(actionName);
            currentStateArr = result;
            var conditionsAreMet = goapState.areConditionsMet(desiredStateArr, currentStateArr);
            if(conditionsAreMet) {
                foundPlan = true;
                return;
            } else {
				//console.log("Incomplete plan after " + actionName);
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
        } else {
			//console.log("Not pushing " + actionName);
			if(actionName == "upgradeController") {
				_.each(currentStateArr, function(state) {
					//console.log("state: " + state.name + " value: " + state.value);
				});
			}
		}
    });

	if(!foundPlan) {
		//console.log("Failed plan result: " + plan);
	}
    if(foundPlan) {
        return plan;
    } else {
        return false;
    }
}

var wipePlan = function(object) {
    object.memory.activeSource = undefined;
    object.memory.nonFullSpawnOrExtension = undefined;

    object.memory.plan = [];
    object.memory.desiredState = [];
}

module.exports = {
    formulatePlan : formulatePlan,
    wipePlan : wipePlan
}