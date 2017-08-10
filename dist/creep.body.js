var constants = {
    BODY_TYPE_WORKER : 'worker',
}

var getCost = function(body) {
    var cost = 0;
    _.each(body, function(bodyPart) {
        cost += BODYPART_COST[bodyPart];
    });

    return cost;
}

/*
 BODYPART_COST: {
 "move": 50,
 "work": 100,
 "attack": 80,
 "carry": 50,
 "heal": 250,
 "ranged_attack": 150,
 "tough": 10,
 "claim": 600
 },
 */

var workers = [];
workers.push({'body' : [WORK, CARRY, MOVE, MOVE], 'cost' : getCost([WORK, CARRY, MOVE, MOVE])});
workers.push({'body' : [WORK, WORK, CARRY, MOVE, MOVE, MOVE], 'cost' : getCost([WORK, WORK, CARRY, MOVE, MOVE, MOVE])});
workers.push({'body' : [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'cost' : getCost([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE])});


var MAX_ENERGY_TIER_I = 300;
var MAX_ENERGY_TIER_II = 550;
var MAX_ENERGY_TIER_III = 800;
var MAX_ENERGY_TIER_IV = 1300;
var MAX_ENERGY_TIER_V = 1800;

var getBestBody = function(capacity, type = constants.BODY_TYPE_WORKER) {
    var partList = [];
    switch(type) {
        case constants.BODY_TYPE_WORKER:
            partList = workers;
            break;
        default:
            break;
    }

    return _.max(_.filter(partList, function(candidate) {return candidate.cost <= capacity}), 'cost');
}

var getCheapestWorkerCost = function() {
    return _.min(workers, 'cost').cost;
}

module.exports = {
    const : constants,
    getBestBody: getBestBody,
    getCheapestWorkerCost : getCheapestWorkerCost,
    workers,
    MAX_ENERGY_TIER_I,
    MAX_ENERGY_TIER_II,
    MAX_ENERGY_TIER_III,
    MAX_ENERGY_TIER_IV,
    MAX_ENERGY_TIER_V,
};