import * as THREE from 'three'
import World, { IKeyMap } from '../World'
import Action from '../Action'
import Animations from './Animations'
import HitBox from './HitBox'

const options = {
    disposeTimeout: 5000,
}

export default abstract class Unit {
    protected constructor(model: any) {
        this.world = World.getInstance()
        this.model = model
        this.position = model.position
        this.animations = new Animations(this)
        //  if (this.isPlayer) this.aimTracer = new AimTracer(this)
        this.world.add(this)
    }
    public update(delta: number, nearObjects: Unit[], keyMap: IKeyMap, mousePosition: THREE.Vector2): void {
        this.tickTimestamp = performance.now()
        if (this.hp <= 0) {
            this.animations.play(this)
            this.animations.mixer.update(delta / 1000)
            if (this.hitBox) {
                this.model.remove(this.hitBox)
                this.hitBox = undefined
            }
            if (!this.timeout)
                this.timeout = setTimeout(() => {
                    this.world.remove(this)
                }, options.disposeTimeout)
            return
        }
        let newHp = Number((this.hp + this.hpRegen * (delta / 1000)).toFixed(2))
        if (newHp > this.maxHp) newHp = this.maxHp
        if (this.hitBox) this.hitBox.update(newHp)
        this.hp = newHp
        this.animations.mixer.update(delta / 1000)
        this.actionHandler(delta, keyMap, mousePosition)
        this.detectCollisions(nearObjects)
        this.updateActions(delta)
        this.animations.play(this)
        const newPosition = {
            x: this.position.x + this.dX * (delta / 1000),
            z: this.position.z + this.dZ * (delta / 1000),
        }
        if (Math.abs(newPosition.x) < this.world.size / 2 && Math.abs(newPosition.z) < this.world.size / 2) {
            this.position.x = newPosition.x
            this.position.z = newPosition.z
        }
        this.model.rotation.set(0, this.rotationAngle, 0)
    }
    public abstract maxHp: number
    public abstract hp: number
    public abstract speed: number
    public position: THREE.Vector3
    public actions: Action[] = []
    public model: THREE.Group & { animations: any }
    public currentAction?: Action
    public quadtreeIndex?: number
    public rotationAngle = 0
    public size = 50
    public dX = 0
    public dZ = 0
    public animations: Animations
    protected abstract actionHandler(...args: any): void
    protected abstract updateActions(delta: number): void
    protected abstract hpRegen: number
    protected hitBox?: HitBox
    protected world: World
    protected tickTimestamp?: number
    private detectCollisions(units: Unit[]) {
        const collisions = units.filter(
            unit =>
                this !== unit &&
                (unit.position.x - this.position.x) ** 2 + (unit.position.z - this.position.z) ** 2 <
                    this.size ** 2 + unit.size ** 2,
        )
        if (collisions.length) {
            collisions.forEach(unit => {
                Unit.handleCollision(this, unit)
            })
        }
    }
    private static handleCollision(obj1: Unit, obj2: Unit): void {
        const dx = obj2.position.x - obj1.position.x
        const dz = obj2.position.z - obj1.position.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (obj1.size + obj2.size >= dist) {
            const nx = dx / dist
            const nz = dz / dist
            const touchDistFromObj1 = dist * (obj1.size / (obj1.size + obj2.size))
            const contactX = obj1.position.x + nx * touchDistFromObj1
            const contactZ = obj1.position.z + nz * touchDistFromObj1

            obj1.position.x = contactX - nx * obj1.size
            obj1.position.z = contactZ - nz * obj1.size

            obj2.position.x = contactX + nx * obj2.size
            obj2.position.z = contactZ + nz * obj2.size
        }
    }

    private timeout?: any
}
