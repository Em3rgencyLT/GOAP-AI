var goapState = require('goap.state');
var goapAction = require('goap.action');

var astarNode = function () {
    this.stateArr = [];
    this.parentNode = -1;
    this.g = 0;
    this.h = 0;
    this.f = 0;
    this.actionName = "";
}

var calculateHeuristic = function(currentStateArr, desiredStateArr , actionName) {
    var distance = 0;
    var action = new goapAction.actions[actionName]();
    var actionPostConditionArr = action.postconditions;

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

var searchForPlan = function (currentStateArr, goalStateArr) {
    var openList = [];
    var closedList = [];
    var plan = [];

    var node0 = new astarNode();
    node0.stateArr = currentStateArr;
    node0.parentNode = -1;
    openList.push(node0);

    while(openList.length > 0) {
        var currentNode = findLowestFNode(openList);
        var index = openList.indexOf(currentNode);
        openList.splice(index, 1);

        if(goapState.areConditionsMet(goalStateArr, currentNode.stateArr)) {
            plan = buildPlan(openList, index);
            break;
        }
        closedList.push(currentNode);
        _.each(goapAction.getPossibleActionNames(currentNode.stateArr), function(actionName) {
            var node = new astarNode();
            node.stateArr = goapAction.applyActionToState(currentNode.stateArr, actionName);
            node.parentNode = index;
            node.actionName = actionName;
            var actionObject = new goapAction.actions[actionName]();
            var cost = currentNode.g + actionObject.cost;
            var openListId = _.findIndex(openList, node);
            var closedListId = _.findIndex(openList, node);

            if(openListId > 0 && cost < openList[openListId].g) {
                openList.splice(openListId, 1);
                openListId = -1;
            }

            if(closedListId > 0 && cost < closedList[closedListId].g) {
                closedList.splice(closedListId, 1);
                closedListId = -1;
            }
            if(openListId == -1 && closedListId == -1) {
                node.g = cost;
                node.h = calculateHeuristic(node.stateArr, goalStateArr, actionName);
                node.f = node.g + node.h;
                openList.push(node);
            }
        });
    }

    return plan;
}

var findLowestFNode = function (list) {
    var minNode = _.min(list, function (node) {
        return node.f;
    });
    return minNode;
}

var buildPlan = function (openList, index) {
    var plan = [];
    while(index > 0) {
        plan.push(openList[index].actionName);
        index = openList[index].parentNode;
    }
    return plan;
}


module.exports = {
    searchForPlan : searchForPlan
}