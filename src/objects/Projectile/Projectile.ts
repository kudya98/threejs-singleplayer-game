import * as THREE from 'three'
import Unit from '../Unit/Unit'
import World from '../World'
import { lineCircle } from '../../helpers/lineCircle'

const DESTROY_TIMEOUT = 2000

export interface IOptions {
    speed: number
}

export default abstract class Projectile extends THREE.Mesh {
    protected constructor(
        geometry: THREE.BufferGeometry,
        material: THREE.Material,
        owner: Unit,
        direction: THREE.Vector2,
        options: IOptions,
    ) {
        super(geometry, material)
        this.owner = owner
        this.world = World.getInstance()
        //зависит от моделек
        this.position.y = owner.position.y + 150
        this.position.x = owner.position.x + owner.size * direction.x
        this.position.z = owner.position.z + owner.size * direction.y
        this.rotationAngle = Math.atan2(direction.y, direction.x) - Math.PI / 2
        this.rotateX(Math.PI / 2)
        this.rotateZ(this.rotationAngle)
        this.dX = options.speed * direction.x
        this.dZ = options.speed * direction.y
        this.world.add(this)
    }
    public abstract update(delta: number, nearObjects: Unit[]): void
    public quadtreeIndex?: number
    protected world: World
    protected dX: number
    protected dZ: number
    protected rotationAngle: number
    protected owner: Unit
    protected destroyTimeout = DESTROY_TIMEOUT
    protected detectCollisions(units: Unit[], newX: number, newZ: number): Unit[] {
        return units.filter(
            unit =>
                this.owner !== unit &&
                lineCircle(this.position.x, this.position.z, newX, newZ, unit.position.x, unit.position.z, unit.size),
        )
    }
}
