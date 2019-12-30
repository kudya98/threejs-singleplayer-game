import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import Unit from './Unit'
import { getAnimationName } from '../../helpers/getAnimationName'
import Action from '../Action'
import HitBox from './HitBox'

interface IOptions {
    hp: number
    speed: number
    hpRegen: number
    damage: number
    attackRange: number
    attackDuration: number
    spotDistance: number
}

export default class Zombie extends Unit {
    constructor(model: any, x: number, z: number, options: IOptions) {
        super(model)
        this.options = options
        this.position.x = x
        this.position.z = z
        this.maxHp = this.options.hp
        this.hp = this.options.hp
        this.speed = this.options.speed
        this.hpRegen = this.options.hpRegen
        this.actions = [
            new Action({
                name: 'attack',
                duration: options.attackDuration,
                unit: this,
                onStart: () => {
                    return this.distanceToTraget() < this.options.attackRange
                },
                onStop: () => {},
                onComplete: (target: Unit) => {
                    if (this.distanceToTraget() < this.options.attackRange) {
                        target.hp -= this.options.damage
                        const animation = target.animations.list.find(animation => animation.name === 'hit')
                        if (animation) {
                            animation.reset()
                            animation.play()
                        }
                    }
                },
            }),
        ]
        this.target = this.world.player
        this.hitBox = new HitBox(this)
    }

    public updateTarget() {
        this.target = this.world.player
    }
    public maxHp: number
    public hp: number
    public speed: number
    protected hpRegen: number
    protected updateActions(delta: number) {
        this.actions.forEach(action => action.update(delta))
    }
    protected actionHandler(delta: number) {
        const attack = this.actions.find(action => (action.name = 'attack'))
        if (this.target && this.target.hp > 0) {
            const vectorToTarget = new THREE.Vector2(
                -this.position.x + this.target.position.x,
                -this.position.z + this.target.position.z,
            ).normalize()
            if (attack && this.distanceToTraget() < this.options.attackRange) {
                this.dX = this.dZ = 0
                attack.start(this.target)
            } else if (this.distanceToTraget() > this.options.spotDistance) {
                this.dX = 0
                this.dZ = 0
            } else {
                this.dX = this.speed * vectorToTarget.x
                this.dZ = this.speed * vectorToTarget.y
            }
            this.rotationAngle = Math.atan2(vectorToTarget.x, vectorToTarget.y)
        } else {
            this.dX = 0
            this.dZ = 0
        }
    }
    private options: IOptions
    private target?: Unit
    private distanceToTraget(): number {
        if (this.target) {
            const pos1 = new THREE.Vector2(this.position.x, this.position.z)
            const pos2 = new THREE.Vector2(this.target.position.x, this.target.position.z)
            return pos1.distanceTo(pos2)
        } else {
            return Infinity
        }
    }

    public static loadModel(callback: (model: THREE.Group) => void) {
        const loader = new FBXLoader()
        loader.load(Zombie.modelPath, (model: any) => {
            model.animations = []
            for (let i = 0; i < Zombie.animationsPath.length; i++) {
                loader.load(Zombie.animationsPath[i], ({ animations }: any) => {
                    animations[0].name = getAnimationName(Zombie.animationsPath[i])
                    model.animations.push(animations[0])
                    if (model.animations.length === Zombie.animationsPath.length) {
                        callback(model)
                    }
                })
            }
        })
    }
    private static modelPath = 'textures/zombie/model.fbx'
    private static animationsPath: string[] = [
        'textures/zombie/idle.fbx',
        'textures/zombie/walkforward.fbx',
        'textures/zombie/attack.fbx',
        'textures/zombie/dying.fbx',
        'textures/zombie/hit.fbx',
    ]
}
