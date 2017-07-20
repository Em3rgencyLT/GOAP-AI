var goapState = require('goap.state');
var goapAction = require('goap.action');
var goapPlan = require('goap.plan');

module.exports.loop = function () {
    updateMemory();
}

function updateMemory() {
    Memory.rooms = {};
    _.each(Game.rooms, function(room) {
        Memory.rooms[room.name] = {}
        Memory.rooms[room.name].state = goapState.getRoomStateArr(room);
        Memory.rooms[room.name].spawns = [];
        Memory.rooms[room.name].creeps = {};
        _.each(Game.spawns, function(spawn) {
            if(spawn.room.name === room.name) {
                Memory.rooms[room.name].spawns.push(spawn.name);
            }
        });
        _.each(Game.creeps, function(creep) {
            if(creep.room.name === room.name) {
                creep.memory.state = goapState.getCreepStateArr(creep);
                Memory.rooms[room.name].creeps[creep.name] = Memory.creeps[creep];
            }
        });
    });

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}