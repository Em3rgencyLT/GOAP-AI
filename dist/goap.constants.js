var constants = {
    STATE_ACTOR_HAS_MOVE : 'actorHasMove',
    STATE_ACTOR_HAS_CARRY : 'actorHasCarry',
    STATE_ACTOR_HAS_WORK : 'actorHasWork',
    STATE_ACTOR_NO_ENERGY : 'actorNoEnergy',
    STATE_ACTOR_FULL_ENERGY : 'actorFullEnergy',
    STATE_ACTOR_FOUND_ACTIVE_SOURCE : 'actorFoundActiveSource',
    STATE_ACTOR_FOUND_NON_FULL_SPAWN_OR_EXTENSION : 'actorFoundNonFullSpawnOrExtension',
	STATE_ACTOR_FOUND_NON_EMPTY_SPAWN_OR_EXTENSION : 'actorFoundNonEmptySpawnOrExtension',
    STATE_ACTOR_IS_SPAWN: 'actorIsSpawn',
    STATE_ROOM_HAS_A_SOURCE: 'roomHasASource',
    STATE_ROOM_HAS_A_WORKER : 'roomHasAWorker',
    STATE_ROOM_HAS_MORE_WORKERS: 'roomHasMoreWorkers',
	STATE_ROOM_HAS_ENERGY: 'roomHasEnergy',
    STATE_ROOM_HAS_ENOUGH_ENERGY_FOR_A_WORKER : 'roomHasEnoughEnergyForAWorker',
	STATE_ROOM_CONTROLLER_IS_MAX_LEVEL: 'roomControllerIsMaxLevel',
    STATE_ROOM_HAS_ACTORS_HARVESTING_ENERGY: 'roomHasActorsHarvestingEnergy',
    STATE_ROOM_HAS_ALL_SOURCES_TAPPED: 'roomHasAllSourcesTapped',
    STATE_SPAWN_AND_EXTENSION_ENERGY_FULL : 'spawnAndExtensionEnergyFull',

    ACTION_FIND_ACTIVE_SOURCE : 'findActiveSource',
    ACTION_FIND_ACTIVE_NON_FULLY_TAPPED_SOURCE : 'findActiveNonFullyTappedSource',
    ACTION_HARVEST_SOURCE : 'harvestSource',
    ACTION_WITHDRAW_ENERGY_FROM_SPAWN_OR_EXTENSION: 'withdrawEnergyFromSpawnOrExtension',
    ACTION_DEPOSIT_ENERGY_TO_SPAWN_OR_EXTENSION : 'depositEnergyToSpawnOrExtension',
    ACTION_FIND_NON_FULL_SPAWN_OR_EXTENSION : 'findNonFullSpawnOrExtension',
    ACTION_FIND_NON_EMPTY_SPAWN_OR_EXTENSION : 'findNonEmptySpawnOrExtension',
    ACTION_BUILD_WORKER: 'buildWorker',
    ACTION_UPGRADE_CONTROLLER: 'upgradeController',

    GOAL_SET_SPAWN : 'goalSetSpawn',
    GOAL_SET_CREEP: 'goalSetCreep',
    GOAL_SET_ROOM: 'goalSetRoom,'
}

module.exports = {
    constants
}