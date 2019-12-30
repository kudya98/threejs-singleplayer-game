import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils'
import Zombie from './Zombie'
import World from '../World'

export default class ZombieFactory {
    public static spawnZombie(x: number, y: number): void {
        const options = {
            hp: 500,
            speed: 50,
            hpRegen: 10,
            damage: 200,
            attackRange: 200,
            attackDuration: 1100,
            spotDistance: 1000,
        }
        const world = World.getInstance()
        const { animations } = world.models.zombie
        const model: any = SkeletonUtils.clone(world.models.zombie)
        model.animations = animations
        new Zombie(model, x, y, options)
    }
}
