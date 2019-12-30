import * as THREE from 'three'
import Projectile, { IOptions } from './Projectile'
import Unit from '../Unit/Unit'

const options = {
    damage: 40,
}

export default class RifleBullet extends Projectile {
    constructor(owner: Unit, direction: THREE.Vector2, options: IOptions) {
        const geometry = new THREE.SphereBufferGeometry(5, 128, 128)
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
        })
        super(geometry, material, owner, direction, options)
    }
    public update(delta: number, nearObjects: Unit[]) {
        if (this.destroyTimeout <= 0) {
            this.world.remove(this)
            return
        }
        this.destroyTimeout -= delta
        const newX = this.position.x + this.dX * (delta / 1000)
        const newZ = this.position.z + this.dZ * (delta / 1000)
        const collisions = this.detectCollisions(nearObjects, newX, newZ)
        this.handleCollisions(collisions)
        this.position.x = newX
        this.position.z = newZ
    }
    protected handleCollisions(collisions: Unit[]): void {
        if (collisions.length) {
            collisions.forEach(unit => {
                unit.hp -= options.damage
                unit.position.x += this.dX * 0.002
                unit.position.z += this.dZ * 0.002
                const animation = unit.animations.list.find(animation => animation.name === 'hit')
                if (animation) {
                    animation.reset()
                    animation.play()
                }
                this.world.remove(this)
            })
        }
    }
}
