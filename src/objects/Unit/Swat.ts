import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { cloneDeep } from 'lodash'
import Unit from './Unit'
import { getAnimationName } from '../../helpers/getAnimationName'
import Action from '../Action'
import World, { IKeyMap } from '../World'
import Rifle from '../Weapon/Rifle'
import Shotgun from '../Weapon/Shotgun'
import Weapon from '../Weapon/Weapon'

const options = {
    energy: 100,
    hp: 1000,
    energyRegen: 10,
    hpRegen: 50,
    speed: 400,
    runSpeed: 800,
    runCost: 30,
}

export default class Swat extends Unit {
    constructor(model: any, x: number, z: number) {
        super(model)
        this.energy = this.maxEnergy = options.energy
        this.energyRegen = options.energyRegen
        this.position.x = x
        this.position.z = z
        this.weapons = [new Rifle(this), new Shotgun(this)]
        this.currentWeapon = this.weapons[0]
        this.actions = [
            new Action({
                name: 'run',
                unit: this,
                onStart: () => {
                    this.speed = options.runSpeed
                    this.energyRegen -= options.runCost
                    return true
                },
                onStop: () => {
                    this.energyRegen += options.runCost
                    this.speed = options.speed
                },
                onComplete: () => {},
            }),
            new Action({
                duration: 50,
                name: 'swapweapon',
                unit: this,
                onStart: (weapon?: Weapon) => {
                    return weapon !== undefined && weapon !== this.currentWeapon
                },
                onStop: () => {},
                onComplete: (newWeapon: Weapon) => {
                    this.currentWeapon = newWeapon
                },
            }),
        ]
    }
    public energy: number
    public maxEnergy: number
    public weapons: Weapon[] = []
    public currentWeapon: Weapon
    public maxHp = options.hp
    public hp = options.hp
    public speed = options.speed
    protected hpRegen = options.hpRegen
    protected actionHandler(delta: number, keyMap: IKeyMap, mousePosition: THREE.Vector2) {
        mousePosition.x += this.dX * (delta / 1000)
        mousePosition.y += this.dZ * (delta / 1000)
        const direction = new THREE.Vector2(
            mousePosition.x - this.position.x,
            mousePosition.y - this.position.z,
        ).normalize()
        const w = +keyMap['KeyW'] || 0
        const s = +keyMap['KeyS'] || 0
        const a = +keyMap['KeyA'] || 0
        const d = +keyMap['KeyD'] || 0
        const r = keyMap['KeyR']
        const lmb = keyMap['ButtonLeft']
        const shift = keyMap['ShiftLeft']
        // const shiftDown = keyMap['ShiftLeft'] && !this.keyMap['ShiftLeft']
        const shiftUp = !keyMap['ShiftLeft'] && this.keyMap['ShiftLeft']
        const digits = [
            keyMap['Digit1'] && !this.keyMap['Digit1'],
            keyMap['Digit2'] && !this.keyMap['Digit2'],
            keyMap['Digit3'] && !this.keyMap['Digit3'],
        ]

        // 1 action per tick
        let actionsCooldown = false
        const run = this.actions.find(action => action.name === 'run')
        const shoot = this.currentWeapon.actions.find(action => action.name === 'shoot')
        const reload = this.currentWeapon.actions.find(action => action.name === 'reload')
        const swapWeapon = this.actions.find(action => action.name === 'swapweapon')
        this.energy = Number((this.energy + this.energyRegen * (delta / 1000)).toFixed(2))
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy
        if (this.energy < 0) this.energy = 0

        if (!actionsCooldown && swapWeapon && digits.includes(true)) {
            const newWeapon = this.weapons[digits.indexOf(true)]
            swapWeapon.start(newWeapon)
            actionsCooldown = true
        }
        if (!actionsCooldown && r && reload) {
            reload.start()
            actionsCooldown = true
        }
        if (!actionsCooldown && lmb && shoot) {
            shoot.start(direction)
            actionsCooldown = true
        }
        if (run && this.currentAction === run && ((this.dX === 0 && this.dZ === 0) || shiftUp || this.energy <= 0)) {
            run.stop()
        }
        if (w > s) {
            if (run && !actionsCooldown && shift && this.energy > 10) {
                run.start()
            }
            if (a === d) {
                this.dX = this.speed * direction.x
                this.dZ = this.speed * direction.y
            } else {
                const vector = direction.clone()
                vector.rotateAround(new THREE.Vector2(0, 0), ((d - a) * Math.PI) / 4)
                this.dX = this.speed * vector.x
                this.dZ = this.speed * vector.y
            }
        } else if (w < s) {
            if (a === d) {
                this.dX = -0.5 * this.speed * direction.x
                this.dZ = -0.5 * this.speed * direction.y
            } else {
                const vector = direction.clone()
                vector.rotateAround(new THREE.Vector2(0, 0), ((a - d) * -3 * Math.PI) / 4)
                this.dX = 0.5 * this.speed * vector.x
                this.dZ = 0.5 * this.speed * vector.y
            }
        } else if (w === s) {
            this.dX = this.dZ = 0
        }
        if (run && this.currentAction === run && this.energy < 0) {
            run.stop()
        }
        this.rotationAngle = Math.atan2(direction.x, direction.y)
        this.keyMap = cloneDeep(keyMap)
    }
    protected updateActions(delta: number) {
        const actions: Action[] = [...this.actions]
        actions.push(...this.currentWeapon.actions)
        actions.forEach(action => action.update(delta))
    }
    // prev tick keymap
    private keyMap: IKeyMap = {}
    private energyRegen: number

    public static loadModel(callback: (model: THREE.Group) => void) {
        const loader = new FBXLoader()
        loader.load(Swat.modelPath, (model: any) => {
            model.animations = []
            for (let i = 0; i < Swat.animationsPath.length; i++) {
                loader.load(Swat.animationsPath[i], ({ animations }: any) => {
                    animations[0].name = getAnimationName(Swat.animationsPath[i])
                    model.animations.push(animations[0])
                    if (model.animations.length === Swat.animationsPath.length) {
                        callback(model)
                    }
                })
            }
        })
    }
    private static modelPath = 'textures/swat/model.fbx'
    private static animationsPath: string[] = [
        'textures/swat/idle.fbx',
        'textures/swat/walkforward.fbx',
        'textures/swat/walkbackward.fbx',
        'textures/swat/shoot.fbx',
        'textures/swat/run.fbx',
        'textures/swat/dying.fbx',
        'textures/swat/hit.fbx',
    ]
}
