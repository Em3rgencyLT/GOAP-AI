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
    var nodeList = [];

    if(goapState.areConditionsMet(goalStateArr, currentStateArr)) {
        //Don't need to do anything
        return plan;
    }

    var node0 = new astarNode();
    node0.stateArr = currentStateArr;
    node0.parentNode = -1;
    openList.push(node0);
    nodeList.push(node0);

    while(openList.length) {
        var currentNode = findLowestFNode(openList);
        var openIndex = _.findIndex(openList, currentNode);
        var index = _.findIndex(nodeList, currentNode);
        openList.splice(openIndex, 1);

        if(goapState.areConditionsMet(goalStateArr, currentNode.stateArr)) {
            plan = buildPlan(nodeList, index);
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
            var openListId = _.findIndex(openList, function(element) {
                return element.actionName == node.actionName && goapState.stateArraysAreIdentical(element.stateArr, node.stateArr)
            });
            var closedListId = _.findIndex(closedList, function(element) {
                return element.actionName == node.actionName && goapState.stateArraysAreIdentical(element.stateArr, node.stateArr)
            });

            if(openListId != -1 && cost < openList[openListId].g) {
                openList.splice(openListId, 1);
                openListId = -1;
            }

            if(closedListId != -1 && cost < closedList[closedListId].g) {
                closedList.splice(closedListId, 1);
                closedListId = -1;
            }
            if(openListId == -1 && closedListId == -1) {
                node.g = cost;
                node.h = calculateHeuristic(node.stateArr, goalStateArr, actionName);
                node.f = node.g + node.h;
                openList.push(node);
                nodeList.push(node);
            }
        });
    }
    //console.log("Came up with plan " + plan.toString());
    return plan;
}

var findLowestFNode = function (list) {
    var minNode = _.min(list, function (node) {
        return node.f;
    });
    return minNode;
}

var buildPlan = function (list, index) {
    var plan = [];
    while(index > 0) {
        plan.push(list[index].actionName);
        index = list[index].parentNode;
    }
    return plan.reverse();
}


module.exports = {
    searchForPlan : searchForPlan
}