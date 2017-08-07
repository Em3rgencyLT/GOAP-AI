var goapState = require('goap.state');

var astarSearch = function (openList, closedList) {
    this.openList = openList;
    this.closedList = closedList;
}

var calculateHeuristic = function(currentStateArr, desiredStateArr , actionPostConditionArr) {
    var distance = 0;

    _.every(actionPostConditionArr, function(postCondition) {
        var desiredState = _.filter(desiredStateArr, function(element) {
            return element.name === postCondition.name;
        })[0];
        var currentState = _.filter(currentStateArr, function(element) {
            return element.name === postCondition.name;
        })[0];

        //state already at correct value, current action will unset, penalizing
        if(desiredState && currentState) {
            if(desiredState.value === currentState.value && postCondition.value !== desiredState.value) {
                distance++;
            }
        }

        //current action will set to wrong value, penalizing
        if(desiredState && desiredState.value !== postCondition.value) {
            distance++;
            return true;
        }

        return true;
    });

    return distance;
}

module.exports = {
    search : astarSearch,
    calculateHeuristic : calculateHeuristic
}