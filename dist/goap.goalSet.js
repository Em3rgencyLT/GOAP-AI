var goapState = require('goap.state');
var constants = require('goap.constants').constants;

var getNextGoal = function (currentStateArr, goalSetType = constants.GOAL_SET_SPAWN) {
    var goalSet = [];
    switch(goalSetType) {
        case constants.GOAL_SET_SPAWN:
            goalSet = spawnerGoalSet;
            break;
        case constants.GOAL_SET_CREEP:
        case constants.GOAL_SET_ROOM:
        default:
            break;
    }

    var result = [];
    _.every(goalSet, function(goal) {
        if(goapState.areConditionsMet(goal.requirements, currentStateArr)) {
            result = goal.goal;
            return false;
        }
        return true;
    });
    return result;
}

var spawnerGoalSet = [];

spawnerGoalSet.push({
    'description' : 'Have energy income',
    'requirements' : [
        new goapState.state(constants.STATE_ROOM_HAS_A_SOURCE, true),
        new goapState.state(constants.STATE_ROOM_HAS_ACTORS_HARVESTING_ENERGY, false),
    ],
    'goal' : [
        new goapState.state(constants.STATE_ROOM_HAS_MORE_WORKERS, true),
    ]
});

spawnerGoalSet.push({
    'description' : 'Have all energy sources fully tapped',
    'requirements' : [
        new goapState.state(constants.STATE_ROOM_HAS_ALL_SOURCES_TAPPED, false),
    ],
    'goal' : [
        new goapState.state(constants.STATE_ROOM_HAS_MORE_WORKERS, true),
    ]
});



module.exports = {
    getNextGoal,
}