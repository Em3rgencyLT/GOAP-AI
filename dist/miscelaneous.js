var getSourceWorkPartCount = function(source, stopAt = 9001) {
    var workPartsHas = 0;
    _.every(source.room.find(FIND_MY_CREEPS), function(creep) {
        if(source.pos.isNearTo(creep)) {
            var workParts = _.filter(creep.body, function(bodyPart) {
                return bodyPart.type === WORK;
            });
            workPartsHas += workParts.length;
        }
        if(workPartsHas >= stopAt) {
            return false;
        }

        return false;
    });

    return workPartsHas;
}

var getSourceMaxWorkPartCount = function(source) {
    return Math.ceil((source.energyCapacity / ENERGY_REGEN_TIME) / HARVEST_POWER);
}

var getObjectHasAdjacentSpace = function(object) {
    var hasSpace = false;
    var data = object.room.lookAtArea(object.pos.y - 1, object.pos.x - 1, object.pos.y + 1, object.pos.x - 1);
    var obstacles = [];
    //_.every instead of _.each so we can break early
    _.every(data, function(dataRow, y) {
        _.every(dataRow, function(entities, x) {
            obstacles = _.filter(entities, function(entity) {
                if(entity.type === LOOK_TERRAIN) {
                    return OBSTACLE_OBJECT_TYPES.includes(entity.terrain);
                } else {
                    return OBSTACLE_OBJECT_TYPES.includes(entity.type);
                }
            });
            if(obstacles.length === 0) {
                hasSpace = true;
            }
            //break loop if found unobstructed spot
            return !hasSpace;
        });
        return !hasSpace;
    });

    return hasSpace;
}

module.exports = {
    getSourceWorkPartCount : getSourceWorkPartCount,
    getSourceMaxWorkPartCount: getSourceMaxWorkPartCount,
    getObjectHasAdjacentSpace: getObjectHasAdjacentSpace,
};